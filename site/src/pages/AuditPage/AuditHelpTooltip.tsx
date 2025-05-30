import {
	HelpTooltip,
	HelpTooltipContent,
	HelpTooltipLink,
	HelpTooltipLinksGroup,
	HelpTooltipText,
	HelpTooltipTitle,
	HelpTooltipTrigger,
} from "components/HelpTooltip/HelpTooltip";
import type { FC } from "react";
import { docs } from "utils/docs";

const Language = {
	title: "What is an audit log?",
	body: "An audit log is a record of events and changes made throughout a system.",
	docs: "Events we track",
};

export const AuditHelpTooltip: FC = () => {
	return (
		<HelpTooltip>
			<HelpTooltipTrigger />

			<HelpTooltipContent>
				<HelpTooltipTitle>{Language.title}</HelpTooltipTitle>
				<HelpTooltipText>{Language.body}</HelpTooltipText>
				<HelpTooltipLinksGroup>
					<HelpTooltipLink href={docs("/admin/security/audit-logs")}>
						{Language.docs}
					</HelpTooltipLink>
				</HelpTooltipLinksGroup>
			</HelpTooltipContent>
		</HelpTooltip>
	);
};
