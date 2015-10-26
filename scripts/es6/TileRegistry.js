class TileRegistry {

    constructor(parentSelector) {
        Utils.assert($(parentSelector).length > 0, "Invalid parameter: parentSelector" + ((parentSelector !== undefined) ? ` (${parentSelector})` : ""));
        Utils.assert($(parentSelector).length === 1, `Invalid parentSelector (too many matches): ${parentSelector}`);

        this.parentSelector = parentSelector;

        this.mainTile = undefined;
        this.tiles = [];
    }

    setMainTile(value, mainTileParent) {
        Utils.assert($(mainTileParent).length > 0, "Invalid parameter: mainTileParent" + ((mainTileParent !== undefined) ? ` (${mainTileParent})` : ""));
        Utils.assert($(mainTileParent).length === 1, `Invalid mainTileParent (too many matches): ${mainTileParent}`);
        this.mainTile = new Tile(value, mainTileParent);
    }

    addTile(value) {
        this.tiles.push(new Tile(value, this.parentSelector));
    }
}