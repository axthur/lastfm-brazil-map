import statesData from '../src/data/states.json' with { type: 'json' };

const IBGE_API_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios';

const normalizeString = (str) => {
    // Remove acentos e converte para maiúsculas
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim();
};

const getStateCodeByNormalizedName = Object.entries(statesData).reduce(
    (acc, [code, name]) => {
        acc[normalizeString(name)] = code;
        return acc;
    }, {}
);

async function getAllCities() {
    const response = await fetch(IBGE_API_URL);

    if (!response.ok) {
        throw new Error('IBGE API request failed');
    }

    const allCities = await response.json();
    return allCities;
}

export default async function handler(req, res) {
    const {
        city
    } = req.query;

    if (!city) {
        console.log(`[IBGE API] Cidade não fornecida.`);
        return res.status(400).json({
            error: "City required"
        });
    }

    try {
        console.log(`[IBGE API] Buscando cidade: ${city}`);

        // Busca todos os municípios da API
        const allCities = await getAllCities();
        if (!allCities || allCities.length === 0) {
            console.log(`[IBGE API] Nenhum município encontrado`);
            return res.status(500).json({
                error: "IBGE API error"
            });
        }

        // Verifica se é um estado brasileiro
        const cityNormalized = normalizeString(city);
        const stateAbbreviation = getStateCodeByNormalizedName[cityNormalized];

        if (stateAbbreviation) {
            console.log(`[IBGE API] Estado encontrado: ${city} - ${stateAbbreviation}`);
            return res.status(200).json({
                city: city,
                state: stateAbbreviation,
            });
        }

        // Busca por correspondência exata primeiro
        let municipality = allCities.find(m =>
            normalizeString(m.nome) === cityNormalized
        );

        // Se não encontrar correspondência exata, busca por cidade que contenha o nome
        if (!municipality) {
            municipality = allCities.find(m =>
                normalizeString(m.nome).includes(cityNormalized)
            );
        }

        // Se ainda não encontrar, retorna 404
        if (!municipality) {
            console.log(`[IBGE API] Cidade não encontrada: ${city}`);
            return res.status(404).json({
                error: "City not found"
            });
        }

        // Extrai a sigla do estado a partir do município
        const state = municipality?.microrregiao?.mesorregiao?.UF?.sigla;

        console.log('[IBGE API] Retornando cidade:', municipality.nome, 'Estado:', state);
        return res.status(200).json({
            city: municipality.nome,
            state: state || null,
        });
    } catch (err) {
        console.error(`[IBGE API] Erro ao buscar cidade ${city}:`, err);
        return res.status(500).json({
            error: "IBGE API error"
        });
    }
}