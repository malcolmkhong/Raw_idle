import { Building } from './building';

export class EfficiencyModifiers {
    // Constants for base efficiency and upgrade limits
    private static BASE_EFFICIENCY = 1.0; // 100%
    private static MAX_UPGRADE_EFFICIENCY = 2.0; // 200%

    // Method to calculate cumulative efficiency given various modifiers
    static calculateCumulativeEfficiency(building: Building, eventModifier: number = 1.0, techBonus: number = 1.0): number {
        // Start with building's base efficiency (after upgrades)
        let cumulativeEfficiency = building.efficiency; 

        // Apply global tier multiplier (if applicable, based on game design)
        // For example, higher tier buildings might have an inherent production bonus
        // cumulativeEfficiency *= this.getTierMultiplier(building.tier);

        // Apply event modifiers
        cumulativeEfficiency *= eventModifier;

        // Apply tech tree bonuses
        cumulativeEfficiency *= techBonus;

        // Ensure efficiency doesn't go below a certain threshold or above a max limit if desired
        // return Math.max(0.1, Math.min(this.MAX_UPGRADE_EFFICIENCY * techBonus, cumulativeEfficiency));

        return cumulativeEfficiency;
    }

    // Placeholder for tier-based multipliers
    static getTierMultiplier(tier: number): number {
        // Example: Tier 1 = 1.0x, Tier 2 = 1.2x, Tier 3 = 1.5x
        switch (tier) {
            case 1: return 1.0;
            case 2: return 1.2;
            case 3: return 1.5;
            default: return 1.0 + (tier - 1) * 0.1; // Simple linear increase
        }
    }

    // Method to apply an upgrade to building efficiency
    static upgradeBuildingEfficiency(building: Building, upgradeAmount: number): void {
        building.efficiency += upgradeAmount;
        // Optionally cap the efficiency at a maximum
        if (building.efficiency > this.MAX_UPGRADE_EFFICIENCY) {
            building.efficiency = this.MAX_UPGRADE_EFFICIENCY;
        }
    }

    // Other methods for managing specific efficiency bonuses or penalties
}

