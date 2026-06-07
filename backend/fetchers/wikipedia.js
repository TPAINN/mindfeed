/**
 * Wikipedia REST API fetcher — no API key needed
 * Endpoint: https://en.wikipedia.org/api/rest_v1/page/summary/{title}
 */

const TOPICS = [
  // Science
  { title: 'Neuroplasticity',           categorySlug: 'science'     },
  { title: 'CRISPR',                    categorySlug: 'science'     },
  { title: 'Quantum_entanglement',      categorySlug: 'science'     },
  { title: 'Photosynthesis',            categorySlug: 'science'     },
  { title: 'Epigenetics',               categorySlug: 'science'     },
  { title: 'Bioluminescence',           categorySlug: 'science'     },
  // Psychology
  { title: 'Cognitive_bias',            categorySlug: 'psychology'  },
  { title: 'Flow_(psychology)',         categorySlug: 'psychology'  },
  { title: 'Placebo_effect',            categorySlug: 'psychology'  },
  { title: 'Mirror_neuron',             categorySlug: 'psychology'  },
  { title: 'Confirmation_bias',         categorySlug: 'psychology'  },
  // Philosophy
  { title: 'Stoicism',                  categorySlug: 'philosophy'  },
  { title: 'Epicureanism',              categorySlug: 'philosophy'  },
  { title: 'Socratic_method',           categorySlug: 'philosophy'  },
  { title: 'Existentialism',            categorySlug: 'philosophy'  },
  // Nature
  { title: 'Mycorrhiza',                categorySlug: 'nature'      },
  { title: 'Mimicry',                   categorySlug: 'nature'      },
  { title: 'Symbiosis',                 categorySlug: 'nature'      },
  { title: 'Apex_predator',             categorySlug: 'nature'      },
  // History
  { title: 'Silk_Road',                 categorySlug: 'history'     },
  { title: 'Printing_press',            categorySlug: 'history'     },
  { title: 'Renaissance',               categorySlug: 'history'     },
  { title: 'Black_Death',               categorySlug: 'history'     },
  // Biology
  { title: 'Microbiome',                categorySlug: 'biology'     },
  { title: 'Telomere',                  categorySlug: 'biology'     },
  { title: 'Mitochondrion',             categorySlug: 'biology'     },
  // Universe
  { title: 'Dark_matter',               categorySlug: 'universe'    },
  { title: 'Neutron_star',              categorySlug: 'universe'    },
  { title: 'Big_Bang',                  categorySlug: 'universe'    },
  // Health
  { title: 'Intermittent_fasting',      categorySlug: 'health'      },
  { title: 'Sleep_deprivation',         categorySlug: 'health'      },
  { title: 'Gut_microbiota',            categorySlug: 'health'      },
  // Mental health
  { title: 'Mindfulness',               categorySlug: 'mentalhealth'},
  { title: 'Cognitive_behavioral_therapy', categorySlug: 'mentalhealth' },
  // Finance
  { title: 'Compound_interest',         categorySlug: 'finance'     },
  { title: 'Index_fund',                categorySlug: 'finance'     },
  // Self-improvement
  { title: 'Habit_(psychology)',        categorySlug: 'self-improvement' },
  { title: 'Procrastination',           categorySlug: 'self-improvement' },
  // Fun facts
  { title: 'Tardigrade',                categorySlug: 'funfacts'    },
  { title: 'Mantis_shrimp',             categorySlug: 'funfacts'    },
];

async function fetchWikipediaPage(title, categorySlug) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'MindFeed/1.0' },
  });
  if (!res.ok) throw new Error(`Wikipedia API error ${res.status} for "${title}"`);
  const data = await res.json();

  if (!data.extract || data.extract.length < 100) {
    throw new Error(`Extract too short for "${title}"`);
  }

  return {
    title:       data.title,
    body:        data.extract,
    sourceUrl:   data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${title}`,
    sourceType:  'website',
    sourceAuthor:'Wikipedia',
    imageUrl:    data.thumbnail?.source || null,
    categorySlug,
  };
}

async function fetchAllWikipedia(maxTopics = TOPICS.length) {
  const results = [];
  const subset = TOPICS.slice(0, maxTopics);
  for (const { title, categorySlug } of subset) {
    try {
      const item = await fetchWikipediaPage(title, categorySlug);
      results.push(item);
      await new Promise(r => setTimeout(r, 150));
    } catch (err) {
      console.warn(`Wikipedia fetch failed for "${title}": ${err.message}`);
    }
  }
  return results;
}

module.exports = { fetchAllWikipedia, fetchWikipediaPage, TOPICS };
