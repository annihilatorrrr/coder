import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import type {
	UpdateUserQuietHoursScheduleRequest,
	UserQuietHoursScheduleResponse,
} from "api/typesGenerated";
import { Alert } from "components/Alert/Alert";
import { ErrorAlert } from "components/Alert/ErrorAlert";
import { Button } from "components/Button/Button";
import { Form, FormFields } from "components/Form/Form";
import { Spinner } from "components/Spinner/Spinner";
import { Stack } from "components/Stack/Stack";
import { type FormikContextType, useFormik } from "formik";
import { type FC, useEffect, useState } from "react";
import { getFormHelpers } from "utils/formUtils";
import { quietHoursDisplay, timeToCron, validTime } from "utils/schedule";
import { getPreferredTimezone, timeZones } from "utils/timeZones";
import * as Yup from "yup";

interface ScheduleFormValues {
	time: string;
	timezone: string;
}

const validationSchema = Yup.object({
	time: Yup.string()
		.ensure()
		.test("is-time-string", "Time must be in HH:mm format.", (value) => {
			if (!validTime(value)) {
				return false;
			}
			const parts = value.split(":");
			const HH = Number(parts[0]);
			const mm = Number(parts[1]);
			return HH >= 0 && HH <= 23 && mm >= 0 && mm <= 59;
		}),
	timezone: Yup.string().required(),
});

interface ScheduleFormProps {
	isLoading: boolean;
	initialValues: UserQuietHoursScheduleResponse;
	submitError: unknown;
	onSubmit: (data: UpdateUserQuietHoursScheduleRequest) => void;
	// now can be set to force the time used for "Next occurrence" in tests.
	now?: Date;
}

export const ScheduleForm: FC<ScheduleFormProps> = ({
	isLoading,
	initialValues,
	submitError,
	onSubmit,
	now,
}) => {
	// Update every 15 seconds to update the "Next occurrence" field.
	const [, setTime] = useState<number>(Date.now());
	useEffect(() => {
		const interval = setInterval(() => setTime(Date.now()), 15000);
		return () => {
			clearInterval(interval);
		};
	}, []);

	// If the user has a custom schedule, use that as the initial values.
	// Otherwise, use the default time, with their local timezone.
	const formInitialValues = { ...initialValues };
	if (!initialValues.user_set) {
		formInitialValues.timezone = getPreferredTimezone();
	}

	const form: FormikContextType<ScheduleFormValues> =
		useFormik<ScheduleFormValues>({
			initialValues: formInitialValues,
			validationSchema,
			onSubmit: (values) => {
				onSubmit({
					schedule: timeToCron(values.time, values.timezone),
				});
			},
		});
	const getFieldHelpers = getFormHelpers<ScheduleFormValues>(form, submitError);
	const browserLocale = navigator.language || "en-US";

	return (
		<Form onSubmit={form.handleSubmit}>
			<FormFields>
				{Boolean(submitError) && <ErrorAlert error={submitError} />}

				{!initialValues.user_set && (
					<Alert severity="info">
						You are currently using the default quiet hours schedule, which
						starts every day at <code>{initialValues.time}</code> in{" "}
						<code>{initialValues.timezone}</code>.
					</Alert>
				)}

				{!initialValues.user_can_set && (
					<Alert severity="error">
						Your administrator has disabled the ability to set a custom quiet
						hours schedule.
					</Alert>
				)}

				<Stack direction="row">
					<TextField
						{...getFieldHelpers("time")}
						disabled={isLoading || !initialValues.user_can_set}
						label="Start time"
						type="time"
						fullWidth
					/>
					<TextField
						{...getFieldHelpers("timezone")}
						disabled={isLoading || !initialValues.user_can_set}
						label="Timezone"
						select
						fullWidth
					>
						{timeZones.map((zone) => (
							<MenuItem key={zone} value={zone}>
								{zone}
							</MenuItem>
						))}
					</TextField>
				</Stack>

				<TextField
					disabled
					fullWidth
					label="Next occurrence"
					value={quietHoursDisplay(
						browserLocale,
						form.values.time,
						form.values.timezone,
						now,
					)}
				/>

				<div>
					<Button
						disabled={isLoading || !initialValues.user_can_set}
						type="submit"
					>
						<Spinner loading={isLoading} />
						Update schedule
					</Button>
				</div>
			</FormFields>
		</Form>
	);
};
