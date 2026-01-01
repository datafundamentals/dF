# Zoom Meeting Downloader

A Python tool to download all Zoom cloud recordings for a user to a local directory or external drive.

last time i ran this it worked with this:
`/Users/petecarapetyan/work/primary/dF/tools/zoom_meeting_downloader/venv/bin/python /Users/petecarapetyan/work/primary/dF/tools/zoom_meeting_downloader/my_script.py`

## Prerequisites

1.  **Zoom App**: You need a Zoom OAuth app created in the [Zoom App Marketplace](https://marketplace.zoom.us/).
    *   **Scopes Required**:
        *   `cloud_recording:read:list_user_recordings`
        *   `cloud_recording:read:list_recording_files`
        *   `cloud_recording:read:recording`
    *   **Redirect URI**: Set to `http://localhost:8000` in the Zoom App settings.

2.  **Environment Keys**:
    Create a file at `~/.env.keys` containing your Zoom credentials:
    ```bash
    ZOOM_CLIENT_ID=your_client_id
    ZOOM_CLIENT_SECRET=your_client_secret
    ```

3.  **Python 3**: Ensure Python 3 is installed.

## Setup

1.  Navigate to the tool directory:
    ```bash
    cd tools/zoom_meeting_downloader
    ```

2.  Create and activate a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Configuration

Open `my_script.py` to adjust settings if needed:

*   `DOWNLOAD_BASE_DIR`: Target directory for downloads (default: `/Volumes/Seagate5T/fomoZoomRecordings`).
*   `START_DATE`: The date to start checking for recordings (default: `2023-01-01`).

## Usage

1.  Run the script:
    ```bash
    python3 my_script.py
    ```

2.  **Authorization**:
    *   The script will open a browser window prompting you to authorize the app.
    *   Click "Authorize".
    *   You will be redirected to `localhost:8000`, and the script will capture the code.

3.  **Download Process**:
    *   The script will iterate through months starting from `START_DATE`.
    *   Files are saved in `YYYY-MM` subfolders.
    *   Progress is logged to the terminal and `download_log.txt`.
    *   Existing files are skipped.

## Troubleshooting

*   **Port 8000 in use**: If the script fails to start the local server, ensure port 8000 is free.
    ```bash
    lsof -i :8000
    kill <PID>
    ```
*   **Invalid Scope**: If you see an "Invalid Scope" error during auth, ensure the scopes in your Zoom App match the ones listed in Prerequisites.