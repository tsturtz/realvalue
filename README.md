Real Value OC & LA 
=====================

![Real Value](http://35.160.245.130/c11_realvalue/assets/img/RV-logo2.jpg)


Provides Beautiful Data Visualization using [Leaflet](http://leafletjs.com), [AngularJS](https://angularjs.org/), and [Angular Material](https://material.angularjs.org/latest/).

- displays a score for an area that's searchable on a map
- the areas are sectioned into 3 layers, County, City, Zip Code
- colors are given to each score based on their combined attributes
- the score is derived from calculating the standard deviation from each data set and adding them together
- the datasets that are being calculated are housing(Zillow), crime(downloaded online), jobs (Glassdoor)
- the score adjust in real-time to what the user thinks  are important to them
- the map also gives markers for restaurants and schools in that area when the users zooms in

### Developers and Contributors
This project was developed by [Danh Le](https://github.com/dtle82/), [Taylor Sturtz](https://github.com/tsturtz/) and [Weikuan Sun](https://github.com/weikuansun) with contributions from Tammy Lau, Mike Justo, Miles Bretall and Jason Welch

This project was created using these technologies
=================================

### [AngularJS](https://angularjs.org/)
Our JavaScript framework providing incredible 2 way data binding.
### [Angular Leaflet](http://github.com/tombatossals/angular-leaflet-directive)
Angular Leaflet was chosen over Angular Google Maps.  Our map datasets are largely driven by geoJSON.
### [Angular Material](https://material.angularjs.org/latest/)
Our project was designed with Google Material Design methodology. 
### [d3.JS](https://d3js.org/)
The graphs and pie charts was created using D3, a document database driven library for JavaScript
### [Firebase](https://firebase.google.com/)
Firebase was used to host our datasets that were collected through various APIs.  JSON data was called from Zillow API, Glassdoor, and public crime data files.
