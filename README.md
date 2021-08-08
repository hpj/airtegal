[![Netlify Status](https://api.netlify.com/api/v1/badges/152b2532-f304-4f4f-b4b3-51dacc63dd42/deploy-status)](https://app.netlify.com/sites/airtegal/deploys)
![test](https://github.com/hpj/Airtegal/workflows/test/badge.svg?branch=development)
![deploy](https://github.com/hpj/Airtegal/workflows/test/badge.svg?branch=release)
[![codecov](https://codecov.io/gh/hpj/Airtegal/branch/development/graph/badge.svg?token=REYXUTWCPO)](https://codecov.io/gh/hpj/Airtegal)

### This project will be following an abridged version of [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

Branch name for production releases: [release]  
Branch name for "next release" development: [development]  

---

Each new feature should reside in its own branch, which can be pushed to the central repository for backup/collaboration. But, instead of branching off of main, feature branches use develop as their parent branch. When a feature is complete, it gets merged back into develop. Features should never interact directly with main

---

The overall flow of Gitflow is:

1. Feature branches are created from development
2. When a feature is complete it is merged into the development branch
3. When there's enough changes the development branch is merged into release
4. If an issue in main is detected a hotfix branch is created from release
5. Once the hotfix is complete it is merged to both development and release