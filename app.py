import os
import sys
import subprocess
import time
import signal

# Colored output markers
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def log(tag, message, color=Colors.GREEN):
    print(f"{color}{Colors.BOLD}[{tag}]{Colors.ENDC} {message}")

def run_app():
    # Detect Windows python executable path
    venv_python = os.path.join("venv", "Scripts", "python.exe")
    python_exe = venv_python if os.path.exists(venv_python) else sys.executable

    log("SYSTEM", "Starting Startup Navigator services...", Colors.HEADER)

    # 1. Check database seed state
    log("DATABASE", "Running PostgreSQL database seeding...", Colors.BLUE)
    try:
        # Run seed script synchronously before starting servers
        seed_proc = subprocess.run([python_exe, "backend/app/seed.py"], check=True)
        if seed_proc.returncode == 0:
            log("DATABASE", "Database check/seeding completed successfully.", Colors.GREEN)
    except Exception as e:
        log("DATABASE", f"Database seeding failed or warning: {e}", Colors.WARNING)
        log("DATABASE", "Continuing execution (ensure PostgreSQL credentials are correct in backend/.env).", Colors.WARNING)

    # 2. Spin up FastAPI backend
    log("BACKEND", "Launching FastAPI server on http://127.0.0.1:8000 ...", Colors.BLUE)
    backend_proc = subprocess.Popen(
        [python_exe, "-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        stdout=None,
        stderr=None
    )

    # Give backend a moment to bind to the port
    time.sleep(2)

    # 3. Spin up Next.js frontend
    log("FRONTEND", "Launching Next.js client on http://localhost:3000 ...", Colors.BLUE)
    # Use shell=True for node commands on Windows
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd="frontend",
        shell=True,
        stdout=None,
        stderr=None
    )

    log("SYSTEM", "Startup Navigator is now running!", Colors.GREEN)
    log("SYSTEM", "Press Ctrl+C to stop both servers.", Colors.HEADER)

    # Graceful shutdown handler
    def handle_shutdown(sig, frame):
        log("SYSTEM", "Shutting down servers gracefully...", Colors.WARNING)
        
        # Terminate processes
        try:
            backend_proc.terminate()
            log("BACKEND", "FastAPI server terminated.", Colors.GREEN)
        except Exception:
            pass

        try:
            # On Windows, npm launches sub-shells, so taskkill ensures all child processes die
            if os.name == 'nt':
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(frontend_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                frontend_proc.terminate()
            log("FRONTEND", "Next.js client terminated.", Colors.GREEN)
        except Exception:
            pass
            
        sys.exit(0)

    # Hook signal interrupts
    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)

    # Keep script alive and monitor subprocesses
    try:
        while True:
            # Check if processes crashed
            if backend_proc.poll() is not None:
                log("BACKEND", "FastAPI crashed unexpectedly.", Colors.FAIL)
                handle_shutdown(None, None)
            if frontend_proc.poll() is not None:
                log("FRONTEND", "Next.js client crashed unexpectedly.", Colors.FAIL)
                handle_shutdown(None, None)
            time.sleep(1)
    except KeyboardInterrupt:
        handle_shutdown(None, None)

if __name__ == "__main__":
    run_app()
