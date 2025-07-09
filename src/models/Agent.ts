export interface Agent {
  id: string;
  name: string;
  description: string;
  model: 'gpt-4' | 'claude' | 'mistral' | 'custom';
  createdAt: string;
  status: 'active' | 'inactive';
  temperature: number;
}
