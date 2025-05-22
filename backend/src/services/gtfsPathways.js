// GTFS Pathways Handler
class GTFSPathwaysHandler {
    #pathways = new Map();
    #levels = new Map();

    get pathways() { return this.#pathways; }
    get levels() { return this.#levels; }

    // Process pathways
    #processPathways(pathways) {
        pathways.forEach(pathway => {
            this.#pathways.set(pathway.pathway_id, {
                id: pathway.pathway_id,
                fromStopId: pathway.from_stop_id,
                toStopId: pathway.to_stop_id,
                mode: parseInt(pathway.pathway_mode),
                isBidirectional: pathway.is_bidirectional === '1',
                length: parseFloat(pathway.length),
                traversalTime: parseInt(pathway.traversal_time),
                stairCount: parseInt(pathway.stair_count),
                maxSlope: parseFloat(pathway.max_slope),
                minWidth: parseFloat(pathway.min_width),
                signpostedAs: pathway.signposted_as,
                reversedSignpostedAs: pathway.reversed_signposted_as,
                levelId: pathway.level_id
            });
        });
    }

    // Process levels
    #processLevels(levels) {
        levels.forEach(level => {
            this.#levels.set(level.level_id, {
                id: level.level_id,
                index: parseFloat(level.level_index),
                name: level.level_name
            });
        });
    }

    // Load pathway data
    async loadPathwayData(data) {
        try {
            this.#processPathways(data.pathways || []);
            this.#processLevels(data.levels || []);
            return true;
        } catch (error) {
            console.error('Error loading pathway data:', error);
            return false;
        }
    }

    // Get pathways between stops
    getPathwaysBetweenStops(fromStopId, toStopId) {
        return Array.from(this.#pathways.values())
            .filter(pathway => 
                (pathway.fromStopId === fromStopId && pathway.toStopId === toStopId) ||
                (pathway.isBidirectional && pathway.fromStopId === toStopId && pathway.toStopId === fromStopId)
            );
    }

    // Get all pathways for a stop
    getPathwaysForStop(stopId) {
        return Array.from(this.#pathways.values())
            .filter(pathway => 
                pathway.fromStopId === stopId || 
                (pathway.isBidirectional && pathway.toStopId === stopId)
            );
    }

    // Get level information for a pathway
    getLevelInfo(pathwayId) {
        const pathway = this.#pathways.get(pathwayId);
        if (!pathway || !pathway.levelId) return null;
        return this.#levels.get(pathway.levelId);
    }

    // Get pathway mode description
    getPathwayModeDescription(mode) {
        const modes = {
            1: 'Walkway',
            2: 'Stairs',
            3: 'Moving Sidewalk/Travelator',
            4: 'Escalator',
            5: 'Elevator',
            6: 'Fare Gate',
            7: 'Exit Gate'
        };
        return modes[mode] || 'Unknown';
    }

    // Calculate pathway distance between stops
    calculatePathwayDistance(fromStopId, toStopId) {
        const pathways = this.getPathwaysBetweenStops(fromStopId, toStopId);
        if (pathways.length === 0) return null;

        // If there's a direct pathway, return its length
        const directPathway = pathways.find(p => p.fromStopId === fromStopId && p.toStopId === toStopId);
        if (directPathway) return directPathway.length;

        // Otherwise, find the shortest path through intermediate stops
        const visited = new Set();
        const queue = [{ stopId: fromStopId, distance: 0 }];
        
        while (queue.length > 0) {
            const { stopId, distance } = queue.shift();
            if (stopId === toStopId) return distance;
            if (visited.has(stopId)) continue;
            
            visited.add(stopId);
            const connectedPathways = this.getPathwaysForStop(stopId);
            
            for (const pathway of connectedPathways) {
                const nextStopId = pathway.fromStopId === stopId ? pathway.toStopId : pathway.fromStopId;
                if (!visited.has(nextStopId)) {
                    queue.push({ stopId: nextStopId, distance: distance + pathway.length });
                }
            }
        }
        
        return null;
    }

    // Get accessibility information for a pathway
    getAccessibilityInfo(pathwayId) {
        const pathway = this.#pathways.get(pathwayId);
        if (!pathway) return null;

        return {
            hasStairs: pathway.stairCount > 0,
            stairCount: pathway.stairCount,
            maxSlope: pathway.maxSlope,
            minWidth: pathway.minWidth,
            isElevator: pathway.mode === 5,
            isEscalator: pathway.mode === 4,
            isMovingSidewalk: pathway.mode === 3
        };
    }
}

export default GTFSPathwaysHandler; 