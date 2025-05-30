import { API } from "api/api";
import { workspaceBuildByNumber } from "api/queries/workspaceBuilds";
import dayjs from "dayjs";
import { useWorkspaceBuildLogs } from "hooks/useWorkspaceBuildLogs";
import type { FC } from "react";
import { Helmet } from "react-helmet-async";
import { keepPreviousData, useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { pageTitle } from "utils/page";
import { WorkspaceBuildPageView } from "./WorkspaceBuildPageView";

const WorkspaceBuildPage: FC = () => {
	const params = useParams() as {
		username: string;
		workspace: string;
		buildNumber: string;
	};
	const workspaceName = params.workspace;
	const buildNumber = Number(params.buildNumber);
	const username = params.username.replace("@", "");
	const wsBuildQuery = useQuery({
		...workspaceBuildByNumber(username, workspaceName, buildNumber),
		placeholderData: keepPreviousData,
	});
	const build = wsBuildQuery.data;
	const buildsQuery = useQuery({
		queryKey: ["builds", username, build?.workspace_id],
		queryFn: () => {
			return API.getWorkspaceBuilds(build?.workspace_id ?? "", {
				since: dayjs().add(-30, "day").toISOString(),
			});
		},
		enabled: Boolean(build),
	});
	const logs = useWorkspaceBuildLogs(build?.id);

	return (
		<>
			<Helmet>
				<title>
					{build
						? pageTitle(
								`Build #${build.build_number} · ${build.workspace_name}`,
							)
						: ""}
				</title>
			</Helmet>

			<WorkspaceBuildPageView
				logs={logs}
				build={build}
				buildError={wsBuildQuery.error}
				builds={buildsQuery.data}
				activeBuildNumber={buildNumber}
			/>
		</>
	);
};

export default WorkspaceBuildPage;
