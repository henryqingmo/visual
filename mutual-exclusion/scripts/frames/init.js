
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./title", "./central_overview", "./central_demo", "./ring_overview", "./ring_demo", "./conclusion"],
    function (title, centralOverview, centralDemo, ringOverview, ringDemo, conclusion) {
        return function (player) {
            player.frame("home", "Home", title);
            player.frame("central-overview", "Central Server", centralOverview);
            player.frame("central-demo", "Central Server Walkthrough", centralDemo);
            player.frame("ring-overview", "Token Ring", ringOverview);
            player.frame("ring-demo", "Ring Walkthrough", ringDemo);
            player.frame("conclusion", "Comparison", conclusion);
        };
    });
