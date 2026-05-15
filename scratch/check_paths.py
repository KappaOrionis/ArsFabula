import os
local_app_data = "C:/Users/janvi/AppData/Local/com.janvi.arsfabula/arsfabula.db"
roaming_app_data = "C:/Users/janvi/AppData/Roaming/com.janvi.arsfabula/arsfabula.db"

print("Local exists:", os.path.exists(local_app_data))
print("Roaming exists:", os.path.exists(roaming_app_data))
