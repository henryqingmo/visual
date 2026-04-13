
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout(),
            model = function () { return frame.model(); },
            node = function (id) { return model().nodes.find(id); },
            wait = function () {
                var self = this;
                model().controls.show(function () { player.play(); self.stop(); });
            };

        function resetRa() {
            model().clear();
            model().layoutMode = "ra";
            model().nodeLabelVisible = true;
            model().nodes.create("p1").kind("process").mutexState("released");
            model().nodes.create("p2").kind("process").mutexState("released");
            model().nodes.create("p3").kind("process").mutexState("released");
            ["p1", "p2", "p3"].forEach(function (id) {
                var n = model().nodes.find(id);
                n._lamportT = 0;
                n._requestQueue = [];
            });
            layout.invalidate();
        }

        function raLess(t1, id1, t2, id2) {
            var n1 = parseInt(id1.replace(/^p/, ""), 10),
                n2 = parseInt(id2.replace(/^p/, ""), 10);
            if (t1 !== t2) {
                return t1 < t2;
            }
            return n1 < n2;
        }

        /** Incoming ⟨tIn,fromIn⟩ has higher priority than our ⟨tSelf,selfId⟩. */
        function incomingWins(tIn, fromIn, tSelf, selfId) {
            return raLess(tIn, fromIn, tSelf, selfId);
        }

        frame.after(1, function () {
            resetRa();
        })
            .after(400, function () {
                model().subtitle = '<h2>Scenario</h2>'
                    + '<p><strong>P1</strong> and <strong>P2</strong> both want the CS; <strong>P3</strong> stays released. '
                    + 'P1 uses timestamp <strong>5</strong>, P2 uses <strong>7</strong> (tie-break by id if times were equal).</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(50, function () {
                frame.snapshot();
                model().subtitle = '<p>Both multicast <strong>Request</strong> to the others…</p>'
                    + model().controls.html();
                node("p1").mutexState("wanted");
                node("p1")._lamportT = 5;
                node("p2").mutexState("wanted");
                node("p2")._lamportT = 7;
                layout.invalidate();
                model().send("p1", "p2", { type: "RARQ", tag: "⟨5,1⟩" }, function () {
                    if (incomingWins(5, "p1", node("p2")._lamportT, "p2")) {
                        node("p2")._requestQueue.push({ t: 5, from: "p1" });
                    }
                    layout.invalidate();
                });
                model().send("p1", "p3", { type: "RARQ", tag: "⟨5,1⟩" }, function () {
                    model().send("p3", "p1", { type: "RARP", tag: "Reply" }, function () {
                        layout.invalidate();
                    });
                });
                model().send("p2", "p1", { type: "RARQ", tag: "⟨7,2⟩" }, function () {
                    if (incomingWins(7, "p2", node("p1")._lamportT, "p1")) {
                        node("p1")._requestQueue.push({ t: 7, from: "p2" });
                    } else {
                        model().send("p1", "p2", { type: "RARP", tag: "Reply" }, function () {
                            layout.invalidate();
                        });
                    }
                    layout.invalidate();
                });
                model().send("p2", "p3", { type: "RARQ", tag: "⟨7,2⟩" }, function () {
                    model().send("p3", "p2", { type: "RARP", tag: "Reply" }, function () {
                        layout.invalidate();
                    });
                });
            })
            .after(100, wait).indefinite()
            .after(50, function () {
                frame.snapshot();
                model().subtitle = '<p><strong>⟨5,1⟩</strong> outranks <strong>⟨7,2⟩</strong>, so P2 <strong>defers</strong> its Reply to P1; '
                    + 'P1 <strong>Replies</strong> immediately to P2’s request. P3 Replies to both.</p>'
                    + '<p>P1 now has all Replies → enters the CS.</p>'
                    + model().controls.html();
                layout.invalidate();
                node("p1").mutexState("held");
                node("p2").mutexState("wanted");
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(50, function () {
                frame.snapshot();
                model().subtitle = '<p><strong>P1</strong> <code>exit()</code>s: state <strong>Released</strong>, and sends the '
                    + 'deferred <strong>Reply</strong> to <strong>P2</strong>.</p>'
                    + model().controls.html();
                layout.invalidate();
                node("p1").mutexState("released");
                node("p1")._requestQueue = [];
                layout.invalidate();
                model().send("p1", "p2", { type: "RARP", tag: "Reply" }, function () {
                    node("p2")._requestQueue = [];
                    node("p2").mutexState("held");
                    layout.invalidate();
                });
            })
            .after(100, wait).indefinite()
            .after(50, function () {
                frame.snapshot();
                model().subtitle = '<p><strong>P2</strong> is now <strong>Held</strong>. Bandwidth for one CS entry: '
                    + '<strong>2(N−1)</strong> messages; sync delay after release can be <strong>one hop</strong>.</p>'
                    + model().controls.html();
                layout.invalidate();
            })
            .after(100, wait).indefinite()
            .after(200, function () {
                model().subtitle = "";
                layout.invalidate();
                player.next();
            });

        frame.addEventListener("end", function () {
            model().title = model().subtitle = "";
            layout.invalidate();
        });

        player.play();
    };
});
