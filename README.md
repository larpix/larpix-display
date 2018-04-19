larpix-display
===============

Event display for LArPix.

## Installation

Clone or download this repository. It includes all of the library files
and dependencies, so long as you have a WebGL-enabled browser, such as
any modern version of Chrome, Firefox, Safari, etc. You can verify WebGL
works on your browser [here](https://get.webgl.org/).

## LArPix data files

This event display loads up JSON files, so you'll have to dump the
LArPix .dat files into JSON files. It's relatively simple to do this in
Python once you've converted the .dat files into either ROOT or HDF5
formats. In [larpix-scripts](https://github.com/samkohn/larpix-scripts),
there is a simple Python script for converting from HDF5 to JSON, assuming the
HDF5 file was created using ``dat2h5.py`` with the calibration option. The
expected JSON structure is a simple set of nested arrays, one sub-list
per pixel hit, as shown below.

```json
[
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],  # event 0
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],  # event 1
   ...etc
]
```

The structure for each sub-list is:

```
0. channel id
1. chip id
2. pixel id
3. 10*(pixel x in mm)
4. 10*(pixel y in mm)
5. "raw" ADC counts (from packet)
6. "raw" timestamp (from packet)
7. corrected 6-bit ADC counts
8. corrected timestamp (nanoseconds since UNIX epoch)
9. serial index (internal larpix-control ordering)
10. raw signal voltage (mV)
11. pedestal voltage (mV)
```

The color scale on the event display is given by ``hit[10] - hit[11]``,
in mV.

### Data file index

The data files should be stored in the ``data`` directory. In addition,
a new file called ``fileList.json`` must be manually added to the
``data`` directory. This file contains a listing of all the data files
and also associates a geometry file to each data file. An example
``fileList.json`` file is located at ``data/fileList.json.example``.

## Basic usage

Navigate in your browser to ``index.html``, either by dragging the file
onto a browser window, or by navigating to the absolute path of the
file, ``file:///global/absolute/path/index.html``.

Select a data file to load using the drop-down menu at the top right.

Navigate by left-clicking and dragging to rotate, right-clicking and dragging
pan, and scrolling to zoom in and out.

Hits will load such that the earliest hit on screen is at ``z = 0``, i.e. at
the pixel plane. This is because we have no ``t0``.

The legend will display basic information about the event. In addition, if any
hits are not currently visible on the screen, a red warning will appear.

## Controls

The terms hits and packets are used interchangeably.

- *Hit index* The sequential packet number of the earliest hit displayed
  on screen. Resets to 0 for each new file.

- *Next cluster* Search and load the next cluster. A cluster is defined as a
  certain number of hits within a certain time window. In the _Details_
  drop-down, you can configure the multiplicity cut and time window
  using "Multiplicity cut" and "Time cut". Adjust the "Hits displayed"
  value to change the number of hits actually displayed, e.g. if you
  want to show more hits or fewer hits than required by the multiplicity
  cut.

- *Next anticluster* Search and load the next anticluster. An anticluster is
  defined as all the hits between two quiet periods, subject to a multiplicity
cut. For example:

```
Time -------------->
[ x   x     x x x x           x x x x x            x  x x x  x            ]
 <--Anticluster 1-->       <Anticluster 2>       <Anticluster 3>
```
