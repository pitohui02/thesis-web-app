
If thesis_env does not work
1. Delete the current thesis_env folder and Create a virtual env on thesis-backend on your IDE terminal

# python -m venv <environment_name>

2. Activate the environment

  For windows run the code:

  # environment_name/Scripts/Activate

  For linux/MacOS

  # source environment_name/bin/activate

  To know it is activated it should show (env_name) PS C:\USers\ on your IDE Terminal

  # (thesis_env) PS C:\Users\Marwin Jay\Desktop\School\Thesis\Thesis Web App\thesis-backend> 


3. Install all the packages

# pip install Flask flask-cors numpy tensorflow keras nltk symspellpy

4. Run the server 

# python server.py
