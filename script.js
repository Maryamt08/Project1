$(document).ready(function () {


    const API_KEY = "AIzaSyCrxEcluCzhCTl5OOc6Ow5hu6kNd4TOQOo";

    $("#address").on("change", function () {
        let full_address = $(this).val();
        _log(full_address);
    });


    $("#button").on("click", function () {


        addressVal = $("#address").val();

        if (addressVal === "") {
            M.toast({
                html: 'Input an address!'
            })
        }

        var address = $("#address").val();
        var city = $("#city").val();
        var state = $("#state").val();
        var zip = $("#zip").val();



        clearPrev();
        renderResults();


        //Allows us to clear previous search results and find a new list of addresses when input 
        function clearPrev() {
            $("#testView").empty();
            $("#areaInfo").empty();

        }

        function renderResults() {
            //ajax request for the geocode(longitude and latitude) to be input to the google maps and zomato
            var geocode = `https://maps.googleapis.com/maps/api/geocode/json?address=${address},${city},${state},${zip}&key=${API_KEY}`;

            $.ajax({
                method: "GET",
                url: geocode,
            }).then(function (response) {

                let lat = response.results[0].geometry.location.lat
                let lon = response.results[0].geometry.location.lng

                //google maps query and pushed to dom with marker
                function initMap() {
                    var options = {
                        zoom: 15,
                        center: {
                            lat: lat,
                            lng: lon
                        }
                    }
                    var map = new google.maps.Map(document.getElementById('map'), options);
                    var marker = new google.maps.Marker({
                        position: {
                            lat: lat,
                            lng: lon
                        },
                        map: map
                    });
                }


                //ajax request for the local housing availability
                const housingQuery = {
                    "async": true,
                    "crossDomain": true,
                    "url": "https://realty-mole-property-api.p.rapidapi.com/rentalListings?city=" + city + "&state=" + state,
                    "method": "GET",
                    "headers": {
                        "x-rapidapi-key": "ac391287c0msh2703ef12eb6ea95p10b24djsna1a88fdc8f8d",
                        "x-rapidapi-host": "realty-mole-property-api.p.rapidapi.com"
                    }
                };


                $.ajax(housingQuery).done(function (rentalList) {
                    console.log(rentalList);

                    //ajax request for the local bars and restaurants through zomatoAPI
                    var zomatoAPIKey = "29113c0552a86f3762e7b6325b48d1d0"

                    const zomatoQuery = {
                        "async": true,
                        "crossDomain": true,
                        "url": "https://developers.zomato.com/api/v2.1/geocode?lat=" + lat + "&lon=" + lon,
                        "method": "POST",
                        "headers": {
                            "user-key": "29113c0552a86f3762e7b6325b48d1d0"
                        },
                        "data": {
                            "accessToken": zomatoAPIKey
                        }
                    };

                    $.ajax(zomatoQuery).then(function (zomatoResponse) {
                        console.log(zomatoResponse);
                        var nlIndex = zomatoResponse.popularity.nightlife_index;
                        var linkToZomatoSite = zomatoResponse.link;
                        var areaInfo = $("#areaInfo");
                        var zomatoATag = $("<a>");
                        zomatoATag.attr("class", "zomatoATag")

                        zomatoATag.on("click", function () {
                            var toastHTML = '<span>Leave this website?</span><button id="yes" class="btn-flat toast-action">YES</button><button id="no" class="btn-flat toast-action">NO</button>';
                            M.toast({
                                html: toastHTML
                            });

                            $("#yes").on("click", function () {
                                window.location.href = linkToZomatoSite;
                            });
                            $("#no").on("click", function () {
                                M.Toast.dismissAll();
                            });

                        })

                        zomatoATag.text("Go To Zomato");
                        zomatoATag.attr("class", "linkToZomatoSite btn btn-primary");
                        areaInfo.prepend(zomatoATag);
                        console.log(linkToZomatoSite);


                        //forloop containing the individual containers and information pushed to the DOM
                        for (var i = 0; i < rentalList.length; i++) {
                            listingContainer = $("<div>")
                            listingContent = $("<span>")
                            addTitle = $("<h1>").text(rentalList[i].formattedAddress);
                            price = $("<h4>").text("$ " + rentalList[i].price);
                            propType = $("<p>").text(rentalList[i].propertyType);
                            sqrFoot = $("<p>").text(rentalList[i].squareFootage + " Square Feet");
                            nightLife = $("<p>").text("Nightlife Index: " + nlIndex);

                            var nLat = rentalList[i].longitude;
                            var nLon = rentalList[i].latitude;

                            newMapAPI = "AIzaSyCrxEcluCzhCTl5OOc6Ow5hu6kNd4TOQOo"

                            var newMap = $("<iframe>");
                            newMap.attr("src", "https://www.google.com/maps/embed/v1/place?key=" + newMapAPI + "&q=" + nLon + "," + nLat)
                            newMap.attr("class", "miniMap");


                            listingContent.attr("class", "listingContent");
                            listingContent.append(price, propType, sqrFoot, nightLife)
                            listingContainer.attr("class", "listingContainer");
                            listingContainer.append(addTitle, listingContent, newMap);

                            $("#testView").append(listingContainer);

                        }

                    });

                    $.ajax(zomatoQuery).then(function (zomatoResponse) {
                        console.log(zomatoResponse);
                        var nlIndex = zomatoResponse.popularity.nightlife_index;
                        var linkToZomatoSite = zomatoResponse.link;
                        var areaInfo = $("#areaInfo");
                        var zomatoATag = $("<a>");
                        zomatoATag.attr("href", linkToZomatoSite);
                        zomatoATag.attr("class", "linkToZomatoSite btn btn-primary");
                        zomatoATag.text("Go To Zomato");
                        $(".container").prepend(zomatoATag);
                        console.log(linkToZomatoSite);

                        function clearPrev() {
                            $("#zoma").empty();
                            $("#areaInfo").empty();

                        }

                        //forloop containing the individual containers and information pushed to the DOM
                        for (var i = 0; i < rentalList.length; i++) {
                            listingContainer = $("<div>")
                            addTitle = $("<h1>").text(rentalList[i].formattedAddress);
                            price = $("<h4>").text("$ " + rentalList[i].price);
                            propType = $("<p>").text(rentalList[i].propertyType);
                            sqrFoot = $("<p>").text(rentalList[i].squareFootage + " Square Feet");
                            nightLife = $("<p>").text("Nightlife Index: " + nlIndex);


                            listingContainer.attr("class", "listingContainer");
                            listingContainer.append(addTitle, price, propType, sqrFoot, nightLife);

                            $("#testView").append(listingContainer);

                        };
                    });

                    initMap();



                });

                $("#address").val("");
                $("#city").val("");
                $("#state").val("");
                $("#zip").val("");

            })
        };
    });
    $('.scrollspy').scrollSpy();

});

function _log(s) {
    console.log(s);
}
