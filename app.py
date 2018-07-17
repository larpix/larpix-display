import os
import h5py
import json

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

@app.route('/data/<filename>/event/<event_index>')
def load_event(filename, event_index):
    event_index = int(event_index)
    with h5py.File('static/data/' + filename, 'r') as f:
        events = f['events']
        event = events[event_index]
        hits = f['hits']
        event_hits = hits[event['hit_ref']]
        t0 = min(event_hits['ts'])
        list_to_json = []
        for row in event_hits[['px', 'py', 'ts', 'q']]:
            x, y, t, q = [int(a) for a in row]
            t = int(t-t0)
            list_to_json.append([0, 0, 0, x, y, 0, 0, 0, t, 0, q, 0])
    return json.dumps(list_to_json)
