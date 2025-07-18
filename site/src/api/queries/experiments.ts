import { API } from "api/api";
import { type Experiment, Experiments } from "api/typesGenerated";
import type { MetadataState } from "hooks/useEmbeddedMetadata";
import { cachedQuery } from "./util";

const experimentsKey = ["experiments"] as const;

export const experiments = (metadata: MetadataState<Experiment[]>) => {
	return cachedQuery({
		metadata,
		queryKey: experimentsKey,
		queryFn: () => API.getExperiments(),
	});
};

export const availableExperiments = () => {
	return {
		queryKey: ["availableExperiments"],
		queryFn: async () => API.getAvailableExperiments(),
	};
};

export const isKnownExperiment = (experiment: string): boolean => {
	return Experiments.includes(experiment as Experiment);
};
