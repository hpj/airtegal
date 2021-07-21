[![Netlify Status](https://api.netlify.com/api/v1/badges/152b2532-f304-4f4f-b4b3-51dacc63dd42/deploy-status)](https://app.netlify.com/sites/airtegal/deploys)
![test](https://github.com/hpj/Airtegal/workflows/test/badge.svg?branch=development)
![deploy](https://github.com/hpj/Airtegal/workflows/test/badge.svg?branch=release)
[![codecov](https://codecov.io/gh/hpj/Airtegal/branch/development/graph/badge.svg?token=REYXUTWCPO)](https://codecov.io/gh/hpj/Airtegal)


### This project will be following an abridged version of [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

Branch name for production releases: [main]  
Branch name for "next release" development: [develop]  

---

Each new feature should reside in its own branch, which can be pushed to the central repository for backup/collaboration. But, instead of branching off of main, feature branches use develop as their parent branch. When a feature is complete, it gets merged back into develop. Features should never interact directly with main

---

Once develop has acquired enough features for a release (or a predetermined release date is approaching), you fork a release branch off of develop. Creating this branch starts the next release cycle, so no new features can be added after this point—only bug fixes, documentation generation, and other release-oriented tasks should go in this branch. Once it's ready to ship, the release branch gets merged into main and tagged with a version number. In addition, it should be merged back into develop, which may have progressed since the release was initiated.

Making release branches is another straightforward branching operation. Like feature branches, release branches are based on the develop branch.

---

The overall flow of Gitflow is:

1. A develop branch is created from main
2. A release branch is created from develop
3. Feature branches are created from develop
4. When a feature is complete it is merged into the develop branch
5. When the release branch is done it is merged into develop and main
6. If an issue in main is detected a hotfix branch is created from main
7. Once the hotfix is complete it is merged to both develop and main