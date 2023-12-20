# Generated by Django 4.2.7 on 2023-12-19 19:11
from plane.db.models import WorkspaceUserProperties, ProjectMember, IssueView
from django.db import migrations


def workspace_user_properties(apps, schema_editor):
    WorkspaceMember = apps.get_model("db", "WorkspaceMember")
    updated_workspace_user_properties = []
    for workspace_members in WorkspaceMember.objects.all():
        updated_workspace_user_properties.append(
            WorkspaceUserProperties(
                user_id=workspace_members.member_id,
                filters=workspace_members.view_props.get("filters"),
                display_filters=workspace_members.view_props.get("display_filters"),
                display_properties=workspace_members.view_props.get("display_properties"),
                workspace_id=workspace_members.workspace_id,
            )
        )
    WorkspaceUserProperties.objects.bulk_create(updated_workspace_user_properties, batch_size=2000)


def project_user_properties(apps, schema_editor):
    IssueProperty = apps.get_model("db", "IssueProperty")
    updated_issue_user_properties = []
    for issue_property in IssueProperty.objects.all():
        project_member = ProjectMember.objects.filter(project_id=issue_property.project_id, member_id=issue_property.user_id).first()
        if project_member:
            issue_property.filters = project_member.view_props.get("filters")
            issue_property.display_filters = project_member.view_props.get("display_filters")
            issue_property.display_properties = issue_property.properties
            updated_issue_user_properties.append(issue_property)

    IssueProperty.objects.bulk_update(updated_issue_user_properties, ["filters", "display_filters", "display_properties"], batch_size=2000)


def issue_view(apps, schema_editor):
    GlobalView = apps.get_model("db", "GlobalView")
    updated_issue_views = []
    for global_view in GlobalView.objects.all():
        updated_issue_views.append(
            IssueView(
                workspace_id=global_view.workspace_id,
                name=global_view.name,
                description=global_view.description,
                query=global_view.query,
                access=global_view.access,
                query_data=global_view.query_data,
                sort_order=global_view.sort_order,
            )
        )
    IssueView.objects.bulk_create(updated_issue_views, batch_size=100)


class Migration(migrations.Migration):

    dependencies = [
        ('db', '0051_issueproperty_display_filters_and_more'),
    ]

    operations = [
        migrations.RunPython(workspace_user_properties),
        migrations.RunPython(project_user_properties),
        migrations.RunPython(issue_view),
    ]
