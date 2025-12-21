import * as YAML from 'yaml';
import { isMap, isPair, isSeq, Scalar, YAMLMap, Pair, YAMLSeq } from 'yaml';
import { GeminiResponse } from './gemini.service';

export interface YoutubeNode {
    node: Scalar;
    path: readonly unknown[];
}

export class YamlService {
    static findYoutubeLinks(doc: YAML.Document): { targetNodes: YoutubeNode[], fallbackNodes: YoutubeNode[] } {
        const targetNodes: YoutubeNode[] = [];
        const fallbackNodes: YoutubeNode[] = [];

        if (!doc || !doc.contents) {
            return { targetNodes, fallbackNodes };
        }

        YAML.visit(doc.contents, {
            Scalar(_key, node, path) {
                if (typeof node.value === 'string') {
                    if (/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/.test(node.value)) {
                        
                        // Check if already processed
                        let isProcessed = false;
                        const parent = path[path.length - 1];
                        if (parent && isPair(parent) && parent.key && (parent.key as Scalar).value === 'url') {
                            const grandparent = path[path.length - 2];
                            if (grandparent && isMap(grandparent)) {
                                if (grandparent.has('ai_vitals')) {
                                    isProcessed = true;
                                }
                            }
                        }

                        if (!isProcessed) {
                            targetNodes.push({ node, path: [...path] });
                        } else {
                            fallbackNodes.push({ node, path: [...path] });
                        }
                    }
                }
            }
        });

        return { targetNodes, fallbackNodes };
    }

    static updateVitals(doc: YAML.Document, node: Scalar, path: readonly unknown[], vitals: GeminiResponse) {
        const vitalsMap = new YAMLMap();
        vitalsMap.add(new Pair('title', vitals.title || 'Unknown'));
        vitalsMap.add(new Pair('summary', vitals.summary || ''));
        
        if (vitals.keyPoints && Array.isArray(vitals.keyPoints)) {
            const seq = new YAMLSeq();
            vitals.keyPoints.forEach((p: string) => seq.add(new Scalar(p)));
            vitalsMap.add(new Pair('keyPoints', seq));
        }

        if (vitals.speakers && Array.isArray(vitals.speakers)) {
            const seq = new YAMLSeq();
            vitals.speakers.forEach((p: string) => seq.add(new Scalar(p)));
            vitalsMap.add(new Pair('speakers', seq));
        }

        const parent = path[path.length - 1];

        // Case 1: Already processed (updating existing)
        if (parent && isPair(parent) && parent.key && (parent.key as Scalar).value === 'url') {
            const grandparent = path[path.length - 2];
            if (grandparent && isMap(grandparent)) {
                grandparent.set('ai_vitals', vitalsMap);
            }
        } 
        // Case 2: Raw string (converting to map)
        else {
            const newMap = new YAMLMap();
            newMap.add(new Pair('url', node.value));
            newMap.add(new Pair('ai_vitals', vitalsMap));

            if (isSeq(parent)) {
                const index = parent.items.indexOf(node);
                if (index !== -1) {
                    parent.items[index] = newMap;
                }
            } else if (isPair(parent)) {
                parent.value = newMap;
            } else if (isMap(parent)) {
                // This is tricky if we don't know the key, but usually we are in a sequence or a value of a pair
            }
        }
    }
}
