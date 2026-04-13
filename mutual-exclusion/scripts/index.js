
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, playback*/

define(["./model/model", "./layout/layout", "./frames/init", "../../scripts/domReady/domReady-2.0.1!"], function (Model, Layout, frames, doc) {
    var i, menu, frame,
        player = playback.player();
    player.layout(new Layout("#chart"));
    player.model(new Model());
    player.resizeable(true);
    frames(player);

    function navigateTo(id) {
        var f = player.frame(id.replace(/^#/, ""));
        if (f !== null) {
            player.current(f);
        }
    }
    navigateTo(doc.location.hash);

    $(doc).on("click", ".btn.resume", function () {
        player.current().model().controls.resume.click();
    });

    $(doc).on("click", ".btn.rollback", function () {
        player.current().model().controls.rollback.click();
    });

    $(window).on("hashchange", function () {
        navigateTo(doc.location.hash);
    });

    player.addEventListener("tick", function () {
        player.current().model().tick(player.current().playhead());
        player.layout().messages.invalidate();
    });

    $(doc).keydown(function (e) {
        var button;
        if (e.keyCode === 37) {
            button = $(".btn.rollback");
        } else if (e.keyCode === 39) {
            button = $(".btn.resume");
        }

        if (button && parseInt(button.css("opacity"), 10) > 0) {
            button.click();
        }
    });

    player.addEventListener("framechange", function () {
        $("#currentIndex").text(player.currentIndex() + 1);
    });

    menu = $("nav .dropdown-menu");
    menu.empty();
    for (i = 0; i < player.frames().length; i += 1) {
        frame = player.frame(i);
        $("nav .dropdown-menu").append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#' + frame.id() + '">' + frame.title() + '</a></li>');
    }
});
