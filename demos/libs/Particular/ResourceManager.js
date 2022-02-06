var ResourceManager = function (_classToManage, _amountToPreload, _allowExpansion, _expandBy) {

    this.inactiveResources = new Array();
    this.activeResources = new Array();
    this.resourceClass = _classToManage;
    this.allowExpansion = _allowExpansion;
    this.expandBy = (_expandBy != null && _expandBy != undefined ? _expandBy : 5);

    for (var i = 0; i < _amountToPreload; i++)
        this.inactiveResources.push(new _classToManage(null));

    ResourceManager.prototype.getResource = function (_settings) {

        if (this.inactiveResources.length > 0) {

            var newResource = this.inactiveResources.pop();
            newResource.init(_settings);
            this.activeResources.push(newResource);
            return newResource;
        } else {

            if (this.allowExpansion) {

                for (var i = 0; i < _amountToPreload; i++)
                    this.inactiveResources.push(new this.resourceClass(null));

                return this.getResource(_settings);
            }
        }
    }

    ResourceManager.prototype.createResource = function (_settings) {

        //console.log(this.activeResources.length);

        if (this.inactiveResources.length > 0) {

            var newResource = this.inactiveResources.pop();
            newResource.init(_settings);
            this.activeResources.push(newResource);
        } else {

            if (this.allowExpansion) {

                for (var i = 0; i < _amountToPreload; i++)
                    this.inactiveResources.push(new this.resourceClass(null));

                this.getResource(_settings);
            }
        }
    }

    ResourceManager.prototype.killResource = function (_resource) {

        for (var i = 0; i < this.activeResources.length; i++) {

            if (_resource == this.activeResources[i]) {

                this.activeResources[i].cleanup();
                this.inactiveResources.push(this.activeResources.splice(i, 1)[0]);
                return;
            }
        }
    }

    ResourceManager.prototype.cleanup = function () {

        for (var i = 0; i < this.activeResources.length; i++) {

            this.activeResources[i].cleanup();
            this.inactiveResources.push(this.activeResources.splice(i, 1)[0]);
        }
    }
}