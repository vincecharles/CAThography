// GTFS Fares Handler
class GTFSFaresHandler {
    #fareProducts = new Map();
    #fareMedia = new Map();
    #riderCategories = new Map();
    #fareLegRules = new Map();
    #fareTransferRules = new Map();
    #timeframes = new Map();
    #areas = new Map();
    #stopAreas = new Map();

    get fareProducts() { return this.#fareProducts; }
    get fareMedia() { return this.#fareMedia; }
    get riderCategories() { return this.#riderCategories; }
    get fareLegRules() { return this.#fareLegRules; }
    get fareTransferRules() { return this.#fareTransferRules; }
    get timeframes() { return this.#timeframes; }
    get areas() { return this.#areas; }
    get stopAreas() { return this.#stopAreas; }

    // Process fare products
    #processFareProducts(products) {
        products.forEach(product => {
            this.#fareProducts.set(product.fare_product_id, {
                id: product.fare_product_id,
                name: product.fare_product_name,
                amount: parseFloat(product.amount),
                currency: product.currency,
                fareMediaId: product.fare_media_id,
                riderCategoryId: product.rider_category_id
            });
        });
    }

    // Process fare media
    #processFareMedia(media) {
        media.forEach(medium => {
            this.#fareMedia.set(medium.fare_media_id, {
                id: medium.fare_media_id,
                name: medium.fare_media_name,
                type: parseInt(medium.fare_media_type)
            });
        });
    }

    // Process rider categories
    #processRiderCategories(categories) {
        categories.forEach(category => {
            this.#riderCategories.set(category.rider_category_id, {
                id: category.rider_category_id,
                name: category.rider_category_name,
                isDefault: category.is_default_fare_category === '1',
                eligibilityUrl: category.eligibility_url
            });
        });
    }

    // Process fare leg rules
    #processFareLegRules(rules) {
        rules.forEach(rule => {
            const key = `${rule.from_area_id}-${rule.to_area_id}`;
            this.#fareLegRules.set(key, {
                fromAreaId: rule.from_area_id,
                toAreaId: rule.to_area_id,
                fareProductId: rule.fare_product_id,
                fromTimeframeGroupId: rule.from_timeframe_group_id,
                toTimeframeGroupId: rule.to_timeframe_group_id,
                legGroupId: rule.leg_group_id
            });
        });
    }

    // Process fare transfer rules
    #processFareTransferRules(rules) {
        rules.forEach(rule => {
            const key = `${rule.from_leg_group_id}-${rule.to_leg_group_id}`;
            this.#fareTransferRules.set(key, {
                fromLegGroupId: rule.from_leg_group_id,
                toLegGroupId: rule.to_leg_group_id,
                transferCount: parseInt(rule.transfer_count),
                durationLimit: parseInt(rule.duration_limit),
                durationLimitType: parseInt(rule.duration_limit_type),
                fareTransferType: parseInt(rule.fare_transfer_type),
                fareProductId: rule.fare_product_id
            });
        });
    }

    // Process timeframes
    #processTimeframes(timeframes) {
        timeframes.forEach(timeframe => {
            if (!this.#timeframes.has(timeframe.timeframe_group_id)) {
                this.#timeframes.set(timeframe.timeframe_group_id, []);
            }
            this.#timeframes.get(timeframe.timeframe_group_id).push({
                startTime: timeframe.start_time,
                endTime: timeframe.end_time,
                serviceId: timeframe.service_id
            });
        });
    }

    // Process areas
    #processAreas(areas) {
        areas.forEach(area => {
            this.#areas.set(area.area_id, {
                id: area.area_id,
                name: area.area_name
            });
        });
    }

    // Process stop areas
    #processStopAreas(stopAreas) {
        stopAreas.forEach(stopArea => {
            if (!this.#stopAreas.has(stopArea.area_id)) {
                this.#stopAreas.set(stopArea.area_id, new Set());
            }
            this.#stopAreas.get(stopArea.area_id).add(stopArea.stop_id);
        });
    }

    // Load fare data
    async loadFareData(data) {
        try {
            this.#processFareProducts(data.fare_products || []);
            this.#processFareMedia(data.fare_media || []);
            this.#processRiderCategories(data.rider_categories || []);
            this.#processFareLegRules(data.fare_leg_rules || []);
            this.#processFareTransferRules(data.fare_transfer_rules || []);
            this.#processTimeframes(data.timeframes || []);
            this.#processAreas(data.areas || []);
            this.#processStopAreas(data.stop_areas || []);
            return true;
        } catch (error) {
            console.error('Error loading fare data:', error);
            return false;
        }
    }

    // Get fare for a route
    getFareForRoute(fromStopId, toStopId, time = new Date()) {
        // Find areas for stops
        const fromArea = this.#findAreaForStop(fromStopId);
        const toArea = this.#findAreaForStop(toStopId);

        if (!fromArea || !toArea) return null;

        // Find applicable fare leg rule
        const fareLegRule = this.#fareLegRules.get(`${fromArea}-${toArea}`);
        if (!fareLegRule) return null;

        // Get fare product
        const fareProduct = this.#fareProducts.get(fareLegRule.fareProductId);
        if (!fareProduct) return null;

        // Check if time-based fare applies
        if (fareLegRule.fromTimeframeGroupId) {
            const isInTimeframe = this.#isInTimeframe(time, fareLegRule.fromTimeframeGroupId);
            if (!isInTimeframe) return null;
        }

        return {
            amount: fareProduct.amount,
            currency: fareProduct.currency,
            productName: fareProduct.name,
            media: this.#fareMedia.get(fareProduct.fareMediaId),
            riderCategory: this.#riderCategories.get(fareProduct.riderCategoryId)
        };
    }

    // Find area for a stop
    #findAreaForStop(stopId) {
        for (const [areaId, stops] of this.#stopAreas) {
            if (stops.has(stopId)) {
                return areaId;
            }
        }
        return null;
    }

    // Check if time is within timeframe
    #isInTimeframe(time, timeframeGroupId) {
        const timeframes = this.#timeframes.get(timeframeGroupId);
        if (!timeframes) return false;

        const currentTime = time.toTimeString().slice(0, 8);
        return timeframes.some(tf => 
            currentTime >= tf.startTime && currentTime <= tf.endTime
        );
    }
}

export default GTFSFaresHandler; 