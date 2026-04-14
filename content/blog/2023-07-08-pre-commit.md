---
layout: post
title: "Pre-commit"
description: "This a simple tutorial of pre-commit"
categories: [technology]
tags: [Python, pre-commit, technology]
date: 2023/07/08
---

## Install pre-commit

```bash
pip install pre-commit
```

## Create .pre-commit-config.yaml

```bash
pre-commit sample-config > .pre-commit-config.yaml
```

## Add hooks

```yaml
repos:
  - repo: https://github.com/timothycrosley/isort
    rev: 5.12.0
    hooks:
      - id: isort
        exclude: "(migrations|.cache)/"
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
        args: ["-j8", "--ignore=E402, E203, E501, F401"]
        additional_dependencies:
          [flake8-comprehensions>=3.2.2, flake8-builtins>=1.5.2]
```

## Install hooks

```bash
pre-commit install
```

## Run hooks

```bash
pre-commit run --all-files
```

## Run hooks on staged files

```bash
pre-commit run --files $(git diff --name-only --cached)
```

## Config

| field                   | description                                             | required |
| ----------------------- | ------------------------------------------------------- | -------- |
| id                      | The id of the hook.                                     | Yes      |
| name                    | The name of the hook.                                   | No       |
| alias                   | An alias for the hook.                                  | No       |
| language_version        | The version of the language to use.                     | No       |
| files                   | The files to run the hook on.                           | No       |
| exclude                 | The files to exclude from running the hook on.          | No       |
| types                   | The types of files to run the hook on.                  | No       |
| exclude_types           | The types of files to exclude from running the hook on. | No       |
| args                    | The arguments to pass to the hook.                      | No       |
| stages                  | The stages to run the hook on.                          | No       |
| additional_dependencies | The additional dependencies to install for the hook.    | No       |
| always_run              | Whether to run the hook even if the file is unmodified. | No       |
| verbose                 | Whether to run the hook in verbose mode.                | No       |
| log_file                | The file to log the hook output to.                     | No       |
