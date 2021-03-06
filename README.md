# Real Value OC & LA

**[Live link](http://www.realvalue.io/)**

![Real Value](http://taylorsturtz.com/images/RealValue-WebMock-sm.jpg)

A dynamic web app for visualizing data across LA and Orange counties. Users who are looking to relocate or are just curious about their surroundings will benefit from the data presented. RealValue provides an area score derived from calculating the standard deviation from each data set (average home value, violent crime frequency, job availability) and adding them together. The RealValue score is shown on a color scale and on mouse hover; the score adjusts in real-time according to user selections. On zoom, clusters of restaurants (parks, and schools coming soon) are shown with individual place details on click.

- Provides smooth data visualization using [Leaflet](http://leafletjs.com), [AngularJS](https://angularjs.org/), and [Angular Material](https://material.angularjs.org/latest/).
- displays a score for an area that's searchable on a map
- the areas are sectioned into 3 layers, County, City, Zip Code
- colors are given to each score based on their combined attributes
- the score is derived from calculating the standard deviation from each data set and adding them together
- the datasets that are being calculated are housing(Zillow), crime(downloaded online), jobs (Glassdoor)
- the score adjust in real-time to what the user thinks  are important to them
- the map also gives markers for restaurants and schools in that area when the users zooms in

## Developers and Contributors
This project was developed by [Danh Le](https://github.com/dtle82/), [Taylor Sturtz](https://github.com/tsturtz/) and [Weikuan Sun](https://github.com/weikuansun) with contributions from Tammy Lau, Mike Justo, Miles Bretall and Jason Welch

## Key Technologies

### [AngularJS](https://angularjs.org/)
AngularJS JavaScript framework providing incredible 2 way data binding.
### [Angular Leaflet](http://github.com/tombatossals/angular-leaflet-directive)
Angular Leaflet was chosen over Angular Google Maps. Our map datasets are largely driven by **geoJSON**.
### [Angular Material](https://material.angularjs.org/latest/)
Our project was designed using Angular Material component based framework and with Google Material Design methodology.
### [d3.JS](https://d3js.org/)
The graphs and pie charts was created using D3, a document database driven library for JavaScript.
### [Firebase](https://firebase.google.com/)
Firebase was used to host our datasets that were collected through various APIs. JSON data was called from Zillow API, Glassdoor, and public crime data files.

## Planned Additions

- Add the following data factors to area rating algorithm: **parks** frequency and **schools** frequency and rating.
- Add the following place locations as map pins (buttons with place details): **parks**, **schools**, **museums**, **zoos**, and **hospitals**
- Add user profile to save search locations and favorite specific zip codes
- Collect more robust data for the zip codes with incomplete data in LA & OC, aggregate for **county** and **city** levels
- Complete city level boundary lines
- Output a more friendly number for area ratings (ie: between 0 and 100)
