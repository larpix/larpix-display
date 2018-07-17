import os

from flask import Flask
from flask import render_template
app = Flask(__name__)

@app.route('/')
def load_page():
    return render_template('index.html')

@app.route('/files')
def get_files():
    with open('static/data/fileList.json') as f:
        fileList = f.read()
    return fileList

@app.route('/data/<filename>')
def load_file(filename):
    with open('static/data/' + filename) as f:
        data = f.read()
    return data
