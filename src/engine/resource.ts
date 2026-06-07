
export interface Resource {
    id: string;
    name: string;
    type: 'raw' | 'processed' | 'component' | 'product';
}
