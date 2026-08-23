import os
import sys
import subprocess
import webbrowser
import urllib.parse
import psutil
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI(title="INFI Desktop Agent API", version="1.0.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# App mappings on Windows
APP_MAPPING = {
    "chrome": "chrome.exe",
    "google chrome": "chrome.exe",
    "firefox": "firefox.exe",
    "edge": "msedge.exe",
    "microsoft edge": "msedge.exe",
    "word": "winword.exe",
    "microsoft word": "winword.exe",
    "excel": "excel.exe",
    "microsoft excel": "excel.exe",
    "powerpoint": "powerpnt.exe",
    "microsoft powerpoint": "powerpnt.exe",
    "notepad": "notepad.exe",
    "calculator": "calc.exe",
    "calc": "calc.exe",
    "paint": "mspaint.exe",
    "mspaint": "mspaint.exe",
    "explorer": "explorer.exe",
    "file explorer": "explorer.exe",
    "cmd": "cmd.exe",
    "command prompt": "cmd.exe",
    "powershell": "powershell.exe",
    "spotify": "spotify.exe",
    "vscode": "code.cmd",
    "vs code": "code.cmd",
    "discord": "discord.exe",
    "steam": "steam.exe"
}

class AppRequest(BaseModel):
    name: str

class WebsiteRequest(BaseModel):
    url: str

class SongRequest(BaseModel):
    name: str
    platform: Optional[str] = "youtube"

class VolumeRequest(BaseModel):
    action: str  # "up", "down", "mute"

@app.get("/")
def read_root():
    # Gather system metrics for dashboard
    try:
        cpu = psutil.cpu_percent(interval=None)
        memory = psutil.virtual_memory().percent
        disk = psutil.disk_usage('/').percent
        active_processes = len(psutil.pids())
        status = "INFI Desktop Backend Connected"
    except Exception as e:
        cpu = 0
        memory = 0
        disk = 0
        active_processes = 0
        status = f"Connected with metrics error: {str(e)}"

    return {
        "status": status,
        "os": sys.platform,
        "metrics": {
            "cpu": cpu,
            "memory": memory,
            "disk": disk,
            "processes": active_processes
        }
    }

@app.post("/api/open-app")
def open_app(req: AppRequest):
    app_name = req.name.lower().strip()
    
    # Simple security check to prevent command injection
    clean_name = "".join(c for c in app_name if c.isalnum() or c in " -_")
    
    # Check if this is a known website/service and open in browser
    known_websites = {
        "youtube": "https://youtube.com",
        "google": "https://google.com",
        "instagram": "https://instagram.com",
        "facebook": "https://facebook.com",
        "twitter": "https://x.com",
        "x": "https://x.com",
        "github": "https://github.com",
        "spotify": "https://spotify.com",
        "netflix": "https://netflix.com",
        "chatgpt": "https://chatgpt.com",
        "openai": "https://chatgpt.com",
        "gmail": "https://mail.google.com",
        "amazon": "https://amazon.com",
        "reddit": "https://reddit.com"
    }
    
    if clean_name in known_websites:
        try:
            webbrowser.open(known_websites[clean_name])
            return {"success": True, "message": f"Opening website: {known_websites[clean_name]}"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not open website: {str(e)}")
            
    exe = APP_MAPPING.get(clean_name, clean_name)
    
    try:
        if sys.platform == "win32":
            # For Windows, launch via start command shell
            # Special case for vs code which is code.cmd or code
            if clean_name in ["vscode", "vs code"]:
                subprocess.Popen("code", shell=True)
            else:
                subprocess.Popen(f"start {exe}", shell=True)
        elif sys.platform == "darwin":
            # macOS
            subprocess.Popen(["open", "-a", clean_name])
        else:
            # Linux
            subprocess.Popen([clean_name])
            
        return {"success": True, "message": f"Opening {app_name}"}
    except Exception as e:
        # Fallback: search in common paths or try launching directly
        try:
            subprocess.Popen(exe, shell=True)
            return {"success": True, "message": f"Opening {app_name} (via fallback)"}
        except Exception as err:
            raise HTTPException(status_code=500, detail=f"Could not open application: {str(err)}")

@app.post("/api/open-website")
def open_website(req: WebsiteRequest):
    url = req.url.strip()
    
    # Ensure scheme is present
    if not url.startswith(("http://", "https://")):
        # If it's a search term, search google
        if "." not in url or " " in url:
            url = f"https://www.google.com/search?q={urllib.parse.quote(url)}"
        else:
            url = "https://" + url
            
    try:
        webbrowser.open(url)
        return {"success": True, "message": f"Opening website: {url}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not open website: {str(e)}")

@app.post("/api/play-song")
def play_song(req: SongRequest):
    song_name = req.name.strip()
    platform = (req.platform or "youtube").lower().strip()
    
    try:
        if platform == "spotify":
            query = urllib.parse.quote(song_name)
            spotify_url = f"https://open.spotify.com/search/{query}"
            if sys.platform == "win32":
                try:
                    subprocess.Popen(f"start spotify:search:{query}", shell=True)
                    return {"success": True, "message": f"Playing song on Spotify app: {song_name}"}
                except Exception:
                    webbrowser.open(spotify_url)
            else:
                webbrowser.open(spotify_url)
            return {"success": True, "message": f"Playing song on Spotify: {song_name}"}
        else:
            query = urllib.parse.quote(f"{song_name} audio")
            url = f"https://www.youtube.com/results?search_query={query}"
            webbrowser.open(url)
            return {"success": True, "message": f"Playing song on YouTube: {song_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not play song: {str(e)}")

@app.post("/api/volume")
def adjust_volume(req: VolumeRequest):
    action = req.action.lower().strip()
    try:
        if sys.platform == "win32":
            # Simple volume command using powershell or nircmd
            # Since powershell is built-in on Windows:
            if action == "up":
                # Increase volume (requires pywin32 or command line tools like SoundVolumeView)
                # An easier way is using powershell command to send volume up keystroke (0xAF)
                cmd = "$wsh = New-Object -ComObject Wscript.Shell; $wsh.SendKeys([char]175)"
                subprocess.run(["powershell", "-Command", cmd], capture_output=True)
            elif action == "down":
                # Decrease volume (send keystroke 0xAE)
                cmd = "$wsh = New-Object -ComObject Wscript.Shell; $wsh.SendKeys([char]174)"
                subprocess.run(["powershell", "-Command", cmd], capture_output=True)
            elif action == "mute":
                # Mute volume (send keystroke 0xAD)
                cmd = "$wsh = New-Object -ComObject Wscript.Shell; $wsh.SendKeys([char]173)"
                subprocess.run(["powershell", "-Command", cmd], capture_output=True)
            return {"success": True, "message": f"Volume command execution: {action}"}
        else:
            return {"success": False, "message": "Volume adjustment only supported on Windows"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Volume error: {str(e)}")

@app.post("/api/screenshot")
def take_screenshot():
    try:
        # Use Pillow to capture screenshot
        from PIL import ImageGrab
        # Create a screenshots folder
        os.makedirs("screenshots", exist_ok=True)
        filepath = os.path.join("screenshots", "screenshot.png")
        img = ImageGrab.grab()
        img.save(filepath)
        # Open the screenshot so the user sees it
        if sys.platform == "win32":
            os.startfile(filepath)
        else:
            subprocess.Popen(["open", filepath] if sys.platform == "darwin" else ["xdg-open", filepath])
        return {"success": True, "message": "Screenshot captured and opened."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Screenshot error: {str(e)}")

@app.post("/api/lock")
def lock_pc():
    try:
        if sys.platform == "win32":
            subprocess.run("rundll32.exe user32.dll,LockWorkStation", shell=True)
            return {"success": True, "message": "PC locked."}
        else:
            return {"success": False, "message": "Lock screen only supported on Windows"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lock screen error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000)
