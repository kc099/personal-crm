import importlib

required_packages = [
    "django",
    "rest_framework",
    "channels",
    "paho.mqtt.client",
    "corsheaders"
]

print("🔍 Verifying Python packages in your virtual environment:\n")

for package in required_packages:
    try:
        importlib.import_module(package)
        print(f"✅ {package} is installed.")
    except ImportError:
        print(f"❌ {package} is NOT installed.")

print("\n📌 If any ❌ are shown, activate your environment and run:")
print("    pip install -r requirements.txt")
