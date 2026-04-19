import requests
import os
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv

# --- CONFIGURATION ---
# Load environment variables from ~/.env.keys
load_dotenv(os.path.expanduser("~/.env.keys"))

ACCOUNT_ID = os.getenv('ZOOM_ACCOUNT_ID')
CLIENT_ID = os.getenv('ZOOM_CLIENT_ID')
CLIENT_SECRET = os.getenv('ZOOM_CLIENT_SECRET')
DOWNLOAD_BASE_DIR = '/Volumes/Seagate5T/fomoZoomRecordings'
START_DATE = "2026-01-01" 
LOG_FILE = "log/download_log.txt"

# --- LOGGING SETUP ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler() # This also prints to your terminal
    ]
)

def get_server_to_server_token():
    if not ACCOUNT_ID or not CLIENT_ID or not CLIENT_SECRET:
        logging.error("ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, or ZOOM_CLIENT_SECRET not found in ~/.env.keys")
        return None

    token_url = "https://zoom.us/oauth/token"
    params = {
        "grant_type": "account_credentials",
        "account_id": ACCOUNT_ID,
        # Requesting specific scopes to force a token refresh
        "scope": "user:read:admin cloud_recording:read:list_user_recordings:admin cloud_recording:delete:recording_file:admin"
    }
    
    try:
        response = requests.post(token_url, auth=(CLIENT_ID, CLIENT_SECRET), params=params)
        response.raise_for_status()
        return response.json().get("access_token")
    except Exception as e:
        logging.error(f"Failed to get access token: {e}")
        if response:
            logging.error(f"Response: {response.text}")
        return None

def get_users(token):
    headers = {"Authorization": f"Bearer {token}"}
    users = []
    next_page_token = ""
    
    while True:
        params = {"page_size": 300}
        if next_page_token:
            params["next_page_token"] = next_page_token
        try:
            resp = requests.get("https://api.zoom.us/v2/users", headers=headers, params=params)
            resp.raise_for_status()
            data = resp.json()
            users.extend(data.get("users", []))
            next_page_token = data.get("next_page_token")
            if not next_page_token:
                break
        except Exception as e:
            logging.error(f"Failed to list users: {e}")
            if 'resp' in locals():
                 logging.error(f"Response: {resp.text}")
                 if "does not contain scopes" in resp.text:
                     print("\nCRITICAL ERROR: Missing Scopes!")
                     print("Please go to Zoom App Marketplace > Manage > Your App > Scopes")
                     print("And add the following scopes:")
                     print(" - User: View all user information (user:read:admin)")
                     print(" - Recording: View all user recordings (recording:read:admin)")
                     print("\nThen try again.\n")
            break
            
    return users

def download_file(url, filepath, token):
    separator = "&" if "?" in url else "?"
    file_url = f"{url}{separator}access_token={token}"
    try:
        with requests.get(file_url, stream=True) as r:
            r.raise_for_status()
            with open(filepath, 'wb') as f:
                for chunk in r.iter_content(chunk_size=1024*1024): 
                    f.write(chunk)
    except Exception as e:
        raise e

def delete_recording_file(meeting_id, recording_id, token):
    url = f"https://api.zoom.us/v2/meetings/{meeting_id}/recordings/{recording_id}"
    headers = {"Authorization": f"Bearer {token}"}
    try:
        resp = requests.delete(url, headers=headers)
        if resp.status_code == 204:
            logging.info(f"DELETED from Zoom: {recording_id}")
            return True
        else:
            logging.error(f"Failed to delete {recording_id}: {resp.status_code} - {resp.text}")
            return False
    except Exception as e:
        logging.error(f"Exception deleting {recording_id}: {e}")
        return False

def fetch_and_download_for_user(token, user_id, user_email):
    headers = {"Authorization": f"Bearer {token}"}
    current_date = datetime.strptime(START_DATE, "%Y-%m-%d")
    end_limit = datetime.now()

    if not os.path.exists(DOWNLOAD_BASE_DIR):
        try:
            os.makedirs(DOWNLOAD_BASE_DIR)
        except OSError as e:
            logging.error(f"Could not create download directory {DOWNLOAD_BASE_DIR}: {e}")
            return

    logging.info(f"Starting download for user: {user_email} ({user_id})")

    while current_date < end_limit:
        from_str = current_date.strftime("%Y-%m-%d")
        to_date = current_date + timedelta(days=30)
        to_str = to_date.strftime("%Y-%m-%d")
        
        logging.info(f"Checking range: {from_str} to {to_str} for {user_email}")
        
        next_page_token = ""
        while True:
            params = {
                "from": from_str, "to": to_str, 
                "page_size": 300, "next_page_token": next_page_token
            }
            
            try:
                resp = requests.get(f"https://api.zoom.us/v2/users/{user_id}/recordings", headers=headers, params=params)
                if resp.status_code == 404:
                    logging.warning(f"User {user_id} not found or no recordings.")
                    break
                resp.raise_for_status()
                data = resp.json()
            except Exception as e:
                logging.error(f"API Request failed for {user_email}: {e}")
                if 'resp' in locals():
                     logging.error(f"Response: {resp.text}")
                     if "does not contain scopes" in resp.text:
                         print(f"\nCRITICAL ERROR: Missing Scopes for recordings!")
                         print("Please add: Recording: View all user recordings (recording:read:admin)")
                break
            
            if 'meetings' not in data:
                break

            for m in data['meetings']:
                clean_topic = "".join(x for x in m['topic'] if x.isalnum() or x in "._- ").strip()
                day_str = m['start_time'][:10]
                
                # Determine folder based on meeting date
                meeting_month = day_str[:7] # "YYYY-MM"
                meeting_month_path = os.path.join(DOWNLOAD_BASE_DIR, meeting_month)
                
                if not os.path.exists(meeting_month_path):
                    os.makedirs(meeting_month_path)
                
                for file in m.get('recording_files', []):
                    ext = file['file_type'].lower()
                    filename = f"{day_str}_{clean_topic}_{file['id'][-5:]}.{ext}"
                    filepath = os.path.join(meeting_month_path, filename)
                    
                    if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
                        logging.info(f"SKIPPED: {filename} (Already exists)")
                        # Attempt to delete from Zoom since we have it locally
                        delete_recording_file(m['id'], file['id'], token)
                        continue
                        
                    try:
                        download_file(file.get('download_url'), filepath, token)
                        logging.info(f"SUCCESS: {filename}")
                        # Verify file exists and is not empty before deleting
                        if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
                             delete_recording_file(m['id'], file['id'], token)
                    except Exception as e:
                        logging.error(f"FAILED: {filename} - Error: {e}")

            next_page_token = data.get('next_page_token')
            if not next_page_token:
                break
        
        current_date = to_date

if __name__ == "__main__":
    token = get_server_to_server_token()
    if token:
        logging.info("Successfully authenticated with Server-to-Server OAuth.")
        users = get_users(token)
        logging.info(f"Found {len(users)} users.")
        
        for user in users:
            fetch_and_download_for_user(token, user['id'], user['email'])
            
        logging.info("Process finished.")
    else:
        logging.error("Authentication failed.")