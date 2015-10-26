"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TileRegistry = (function () {
    function TileRegistry(parentSelector) {
        _classCallCheck(this, TileRegistry);

        Utils.assert($(parentSelector).length > 0, "Invalid parameter: parentSelector" + (parentSelector !== undefined ? " (" + parentSelector + ")" : ""));
        Utils.assert($(parentSelector).length === 1, "Invalid parentSelector (too many matches): " + parentSelector);

        this.parentSelector = parentSelector;

        this.mainTile = undefined;
        this.tiles = [];
    }

    _createClass(TileRegistry, [{
        key: "setMainTile",
        value: function setMainTile(value, mainTileParent) {
            Utils.assert($(mainTileParent).length > 0, "Invalid parameter: mainTileParent" + (mainTileParent !== undefined ? " (" + mainTileParent + ")" : ""));
            Utils.assert($(mainTileParent).length === 1, "Invalid mainTileParent (too many matches): " + mainTileParent);
            this.mainTile = new Tile(value, mainTileParent);
        }
    }, {
        key: "addTile",
        value: function addTile(value) {
            this.tiles.push(new Tile(value, this.parentSelector));
        }
    }]);

    return TileRegistry;
})();

//# sourceMappingURL=TileRegistry.js.map