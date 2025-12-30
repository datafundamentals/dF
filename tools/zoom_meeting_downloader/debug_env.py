import os
from dotenv import load_dotenv

env_path = os.path.expanduser("~/.env_keys")
print(f"Loading env from: {env_path}")
if os.path.exists(env_path):
    print("File exists.")
    load_dotenv(env_path)
    print("Keys found:")
    for key in os.environ:
        if "ZOOM" in key:
            print(f"- {key}")
else:
    print("File does not exist.")
