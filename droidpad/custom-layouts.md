---
layout: default
title: DroidPad custom layouts | Digitalsquid
---

Layout editor - DroidPad
========

To easily design layouts, please see the [Layout Editor](/droidpad/layout-editor)

Starting with DroidPad 1.9.2 for phones, DroidPad can use custom, user-defined layouts on the phone. Here are some example documents to help you get started creating some custom layouts.

Format
------

Each layout is written in an XML format – by changing the given examples it should be relatively easy to customise DroidPad.

There are a few properties that can be changed at the top of the samples, such as the title and description. The width and height here are the total size of the grid on which buttons and sliders can be placed.

Each block onscreen is represented by a section starting '<' and ending'>'. The properties (ie. width=”2″) can be edited by changing the value inside the speech marks. To add extra blocks, copy a template line then change the properties to match your requirements.

The most common properties to each block are it’s position (‘x’ and ‘y’) – the represent the offset from the top left corner, where (x=”0″ y=”0″) would represent the corner block itself. The width and height describe how many spaces each block takes up.

Layout types
------------

### Joystick
[Download Sample](/files/droidpad/joystick.txt)

Joystick layouts will automatically send the phone’s tilting as the X and Y axes. The options available here are extra buttons, toggle buttons and sliders.

### Mouse
[Download Sample](/files/droidpad/mouse.txt)

The first three created buttons will correspond to the left, right and middle mouse buttons. The first extra slider will be the scroll wheel, but is optional.
### Trackpad
[Download Sample](/files/droidpad/trackpad.txt)

Trackpad layouts require a ‘panel’, as shown in the sample configuration.

### Slideshow
[Download Sample](/files/droidpad/slideshow.txt)

The slideshow layout requires several buttons, however this is the only functionality it offers. Swapping the button positions around might be useful to some people

Installation
------------

Once you have created a custom layout, copy it to your phone’s SD card, to the following folder:

	<sd card>/Android/data/uk.digitalsquid.droidpad/Custom Layouts
