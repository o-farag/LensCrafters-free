# LensCrafters-free

#### Project Requirements
* Node 16
* Python 3.10

#### Note on cloning
Since this repo using submodules, there are a few extra steps to clone it properly
```
git clone --recurse-submodules git@github.com:Lenscrafters-Capstone/LensCrafters-free.git
```
If that doesn't work, try the following steps instead

```
$ git clone git@github.com:Lenscrafters-Capstone/LensCrafters-free.git
$ git submodule init
$ git submodule update
```

#### Steps to Run Locally: 
1. Install required Python packages: 
    * Create a Python virtual environment with:

        ```
        $ python3 -m venv venv
        ```
    * Activate the virtual environment with: 

        ```
        $ source venv/bin/activate  // for linux
        $ ./venv/Scripts/activate   // for Windows
        ```
    * In the root directory, install required packages by running:

        ```
        $ pip install -r requirements.txt
        ```
        * To deactivate the virtual environment:

            ```
            $ deactivate
            ```

2. Install required frontend packages: 
    * Navigate to the frontend directory with:

        ```
        $ cd frontend/
        ```
        Then run:
        
        ```
        $ npm install
        ``` 
3. Run the application locally:
    * Run script in the root directory:

        ```
        $ ./app
        ```
