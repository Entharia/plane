import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
// hooks
import { useLabel, useMember, useProjectState } from "hooks/store";
// components
import { AppliedFiltersList, SaveFilterView } from "components/issues";
// types
import { IIssueFilterOptions } from "types";
import { useIssues } from "hooks/store/use-issues";
import { EIssueFilterType, EIssuesStoreType } from "constants/issue";

export const ProjectAppliedFiltersRoot: React.FC = observer(() => {
  // router
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query as {
    workspaceSlug: string;
    projectId: string;
  };
  // store hooks
  const {
    project: { projectLabels },
  } = useLabel();
  const {
    issuesFilter: { issueFilters, updateFilters },
  } = useIssues(EIssuesStoreType.PROJECT);

  const { projectStates } = useProjectState();
  // derived values
  const userFilters = issueFilters?.filters;
  // filters whose value not null or empty array
  const appliedFilters: IIssueFilterOptions = {};
  Object.entries(userFilters ?? {}).forEach(([key, value]) => {
    if (!value) return;
    if (Array.isArray(value) && value.length === 0) return;
    appliedFilters[key as keyof IIssueFilterOptions] = value;
  });

  const handleRemoveFilter = (key: keyof IIssueFilterOptions, value: string | null) => {
    if (!workspaceSlug || !projectId) return;
    if (!value) {
      updateFilters(workspaceSlug.toString(), projectId.toString(), EIssueFilterType.FILTERS, {
        [key]: null,
      });
      return;
    }

    let newValues = issueFilters?.filters?.[key] ?? [];
    newValues = newValues.filter((val) => val !== value);

    updateFilters(workspaceSlug.toString(), projectId.toString(), EIssueFilterType.FILTERS, {
      [key]: newValues,
    });
  };

  const handleClearAllFilters = () => {
    if (!workspaceSlug || !projectId) return;
    const newFilters: IIssueFilterOptions = {};
    Object.keys(userFilters ?? {}).forEach((key) => {
      newFilters[key as keyof IIssueFilterOptions] = null;
    });
    updateFilters(workspaceSlug.toString(), projectId.toString(), EIssueFilterType.FILTERS, { ...newFilters });
  };

  // return if no filters are applied
  if (Object.keys(appliedFilters).length === 0) return null;

  return (
    <div className="flex items-center justify-between p-4">
      <AppliedFiltersList
        appliedFilters={appliedFilters}
        handleClearAllFilters={handleClearAllFilters}
        handleRemoveFilter={handleRemoveFilter}
        labels={projectLabels ?? []}
        states={projectStates}
      />

      <SaveFilterView workspaceSlug={workspaceSlug} projectId={projectId} filterParams={appliedFilters} />
    </div>
  );
});
