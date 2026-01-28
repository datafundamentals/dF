import os
import yaml
import subprocess
import sys
from pathlib import Path

def main():
    # Setup paths
    script_dir = Path(__file__).parent.resolve()
    # SITES.yaml is in the workspace root (dF/SITES.yaml)
    # The script is in tools/daily-pub/
    workspace_root = script_dir.parent.parent
    sites_yaml_path = workspace_root / "SITES.yaml"

    if not sites_yaml_path.exists():
        print(f"Error: Could not find SITES.yaml at {sites_yaml_path}")
        sys.exit(1)

    print(f"Reading configuration from: {sites_yaml_path}")
    
    try:
        with open(sites_yaml_path, "r") as f:
            data = yaml.safe_load(f)
    except Exception as e:
        print(f"Error parsing YAML: {e}")
        sys.exit(1)

    sites = data.get("sites", {})
    
    print(f"Found {len(sites)} sites in configuration.")

    for site_key, site_data in sites.items():
        if site_data.get("ignore"):
            print(f"\nSkipping site: {site_key} (ignore: true)")
            continue

        print(f"\nScanning site: {site_key}")

        since = site_data.get("since")
        content_path = site_data.get("content")
        content_root = site_data.get("contentRoot")

        # Validation: Check for missing keys
        missing_keys = []
        if not since: missing_keys.append("since")
        if not content_path: missing_keys.append("content")
        if not content_root: missing_keys.append("contentRoot")

        if missing_keys:
            print(f"  [SKIP] Missing required configuration: {', '.join(missing_keys)}")
            continue

        # Resolve paths
        target_dir = (workspace_root / content_root).resolve()
        
        # Validation: contentRoot existence
        if not target_dir.exists():
            print(f"  [SKIP] Content root directory not found: {target_dir}")
            continue

        # Validation: content path existence (relative to target_dir)
        full_content_path = target_dir / content_path
        if not full_content_path.exists():
            print(f"  [SKIP] Content path not found: {full_content_path}")
            continue

        # If we got here, the site is "set up properly"
        
        # Construct git command
        cmd = [
            "git", "log",
            f"--since={since}",
            "--pretty=format:COMMIT_DATE:%ai",
            "--name-only",
            "--",
            content_path
        ]

        try:
            result = subprocess.run(
                cmd,
                cwd=target_dir,
                capture_output=True,
                text=True,
                check=True 
            )
            
            output = result.stdout.strip()
            if output:
                print(f"  Result: TRUE (Changes detected)")
                print("  Changed files details:")
                
                current_date = None
                for line in output.splitlines():
                    line = line.strip()
                    if not line:
                        continue
                    
                    if line.startswith("COMMIT_DATE:"):
                        current_date = line.replace("COMMIT_DATE:", "").strip()
                    else:
                        if current_date:
                            print(f"    - [{current_date}] {line}")
            else:
                print(f"  Result: FALSE (No changes detected)")

        except subprocess.CalledProcessError as e:
            print(f"  Error executing git command: {e}")
            print(f"  Stderr: {e.stderr}")
        except Exception as e:
            print(f"  Unexpected error: {e}")

    # End of loop

if __name__ == "__main__":
    main()
