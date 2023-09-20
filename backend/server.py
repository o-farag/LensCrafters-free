from flask import Flask


app = Flask(__name__)


@app.route('/data')
def home():
    return {
        'Name': 'geek'
    }


if __name__ == '__main__':
    app.run(port=5100)
