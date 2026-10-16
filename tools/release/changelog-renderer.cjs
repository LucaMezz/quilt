// CommonJS so Nx can require() it directly.
const DefaultChangelogRenderer =
    require("nx/release/changelog-renderer").default;

// Scopes owned by a release group with its own version and changelog.
const SEPARATELY_RELEASED_SCOPES = new Set(["cli", "docs"]);

/**
 * Nx counts a commit as affecting every project when it touches any file outside
 * a project, such as package-lock.json. So `feat(cli): …` commits that add a
 * dependency would otherwise show up in the platform changelog too. Drop those
 * when their scope says they belong to the CLI or docs release instead.
 */
module.exports = class QuiltChangelogRenderer extends DefaultChangelogRenderer {
    filterChanges(changes, project) {
        return super
            .filterChanges(changes, project)
            .filter(
                (change) =>
                    !(
                        change.affectedProjects === "*" &&
                        SEPARATELY_RELEASED_SCOPES.has(change.scope) &&
                        change.scope !== project
                    ),
            );
    }
};
