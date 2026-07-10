import subprocess
import sys
import os
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("Starting FastAPI Backend...")
    # Using shell=True for windows compatibility with uvicorn command
    backend_process = subprocess.Popen(
        "uvicorn main:app --reload",
        cwd=backend_dir,
        shell=True
    )

    print("Starting Vite Frontend...")
    frontend_process = subprocess.Popen(
        "npm run dev",
        cwd=frontend_dir,
        shell=True
    )

    print("\n" + "="*50)
    print("Both servers are starting!")
    print("Backend will be at: http://127.0.0.1:8000")
    print("Frontend will be at: http://localhost:5173")
    print("Press CTRL+C to stop both servers.")
    print("="*50 + "\n")

    try:
        # Keep the main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping servers...")
        backend_process.kill()
        frontend_process.kill()
        sys.exit(0)

if __name__ == "__main__":
    main()
