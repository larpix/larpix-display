larpix-display
===============

Event display for LArPix.

## Installation

Clone or download this repository. It includes all of the library files
and dependencies, so long as you have a WebGL-enabled browser, such as
any modern version of Chrome, Firefox, Safari, etc. You can verify WebGL
works on your browser [here](https://get.webgl.org/).

Once the repository is downloaded, you must make sure all the files have
the appropriate permissions, namely world-readable. There is a helper
script, ``set_permissions.sh`` which you can use to set the permissions
for most of the files. It just has a list of files, though, and doesn't
do anything fancy. So, particularly for your own data files and geometry
files, you'll have to update those permissions yourself using
``chmod a+r data/file1.json data/file2.json ...``. Also, all the directories
must be made world-examinable using the helper script or ``chmod a+x folder``.
Lastly, every time a file is updated by git, the permissions are reset. So if
there is a problem after an update, first make sure all the files have the
correct permissions.

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

The URL will automatically update every time you load new hits. This way, you
can save the URLs for important events, share them, etc.

## Controls

The terms hits and packets are used interchangeably.

- **Hit index** The sequential packet number of the earliest hit displayed
  on screen. Resets to 0 for each new file.

- **Next cluster** Search and load the next cluster. A cluster is defined as a
  certain number of hits within a certain time window. In the _Details_
  drop-down, you can configure the multiplicity cut and time window
  using "Multiplicity cut" and "Time cut". Adjust the "Hits displayed"
  value to change the number of hits actually displayed, e.g. if you
  want to show more hits or fewer hits than required by the multiplicity
  cut.

- **Next anticluster** Search and load the next anticluster. An anticluster is
  defined as all the hits between two quiet periods, subject to a multiplicity
cut. For example:

```
Time -------------->
[ x   x     x x x x           x x x x x            x  x x x  x            ]
 <--Anticluster 1-->       <Anticluster 2>       <Anticluster 3>
```

- **Reset camera** Bring the camera back to the original zoom, pan, and
  rotation so that the pixel plane is centered and parallel to the screen.

- **Data file** Pick the data file to view from the drop-down menu.

- **Details > Hits displayed** The number of hits which are loaded
  onto the display. If not all of them are actually displayed on the
  screen (because of the camera's perspective) then a warning will
  appear below the legend in the bottom left of the screen. Note that
  for clusters, this value is an input to the display, while for
  anticlusters, it is an output.

- **Details > Multiplicity cut** The minimum number of hits required for either
  a cluster or an anticluster.

- **Details > Time cut** The time interval used for identifying clusters and
  anticlusters.

- **Details > Z scale** Controls the Z scale (time
  coordinate), where a larger Z scale means the points appear closer together.
  For an accurate conversion between Z (position) and time, the Z scale should be
  set to 1/(drift speed) in units of ns/mm. The orange ruler for the Z axis will
  adjust in length as the Z scale is adjusted.

- **Details > min/max_index** The range of the "Hit index" slider. These
  fields are automatically adjusted by both "Next" buttons so that it is easy
  to slide a little bit forward and backward. You can also manually adjust these
  sliders, but they will be reset the next time you click either "Next" button.

- **Colors > shading** Turn on/off the shading/shadow effects for the hit
  objects. The shading helps with the 3d effect, but it can make colors.
  like yellow and orange look similar. Turn off shading when the color
  scale interpretation is critical.
