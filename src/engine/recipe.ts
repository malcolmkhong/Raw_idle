
import { Resource } from './resource';

export interface Recipe {
    id: string;
    name: string;
    inputs: { resource: Resource; amount: number; }[];
    outputs: { resource: Resource; amount: number; }[];
    time: number; // Time in seconds to complete one production cycle
}
