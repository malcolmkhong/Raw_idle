"use strict";
// src/backend/techTreeApi.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.techTreeApi = void 0;
const fs = __importStar(require("fs"));
const TECH_TREE_CONFIG_PATH = '/workspace/Raw_idle/tech_tree.json';
class TechTreeAPI {
    constructor() {
        this.techTree = null;
        this.techNodesMap = new Map();
        this.loadTechTree();
    }
    loadTechTree() {
        try {
            const data = fs.readFileSync(TECH_TREE_CONFIG_PATH, 'utf8');
            this.techTree = JSON.parse(data);
            this.buildTechNodesMap();
            console.log('Tech tree loaded successfully.');
        }
        catch (error) {
            console.error('Failed to load tech tree:', error);
            this.techTree = null;
        }
    }
    buildTechNodesMap() {
        if (this.techTree) {
            Object.values(this.techTree).forEach(branch => {
                branch.forEach((node) => {
                    this.techNodesMap.set(node.nodeId, node);
                });
            });
        }
    }
    getTechTree() {
        return this.techTree;
    }
    getTechNode(nodeId) {
        return this.techNodesMap.get(nodeId);
    }
    getAllTechNodes() {
        return Array.from(this.techNodesMap.values());
    }
}
exports.techTreeApi = new TechTreeAPI();
