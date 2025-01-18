#!/bin/bash
sudo yum update -y
sudo yum install -y \
    atk \
    cups-libs \
    libXcomposite \
    libXcursor \
    libXdamage \
    libXi \
    libXtst \
    pango \
    libXrandr \
    alsa-lib \
    gtk3 \
    ipa-gothic-fonts \
    xorg-x11-fonts-Type1 \
    xorg-x11-utils \
    xorg-x11-server-Xvfb
