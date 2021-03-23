# Intro

During the SUSE Hackweek 2021 I decided to create a JS library to interpret openQA logs and create a small application to show the logs as a table with the hability to search and filter. This is a proof of concept 

The original idea comes from the [lnav](http://lnav.org/) that applies different regex to determine the kind of log output. However these logs is a mix of other different logs, so different regex are applied for each line.

# Demo

I provide a playground demo [http://hackweek_2021_openqa_logs.desarrolloproyectos.com/](http://hackweek_2021_openqa_logs.desarrolloproyectos.com/)
I extracted the auto-inst log from https://openqa.opensuse.org/tests/1675833

# Run in you machine

This can be executed using any server (won't work directly on the browser). But you can use [serve](https://www.npmjs.com/package/serve)
