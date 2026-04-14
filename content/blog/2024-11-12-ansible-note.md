---
layout: post
title: "Ansible Note"
description: "Ansible 笔记"
categories: [technology]
tags: [ansible, devops, automation]
date: 2024/11/12
---

# Ansible

## Core Concepts

### Hosts

- Hosts are the servers that Ansible will manage.

### Inventory

- The inventory is a list of hosts that Ansible will manage.
    ```ini
    [webserver]
    web1.example.com host=web1.example.com http_port=80 maxRequestsPerChild=808 # Variables for web1.example.com
    web2.example.com ansible_ssh_port=22 ansible_ssh_user=root 
    
    [dbserver]
    db-[1:3].example.com
    db-[a:f].example.com

    [dbserver:vars] # Variables for the dbserver group
    ansible_ssh_user=ubuntu
    ansible_ssh_private_key_file=~/.ssh/aws.pem

    [servers:children]
    webserver
    dbserver
    ```

- parameters 

  - `ansible_ssh_port`: The SSH port number. This can be useful if you have a non-standard SSH port.
  - `ansible_ssh_user`: The SSH user name. This can be useful if you don't want to use the current user.
  - `ansible_ssh_private_key_file`: The SSH private key file. This can be useful if you have a non-standard SSH key file.
  - `ansible_ssh_pass`: The SSH password. This can be useful if you need to use a password to connect to the host.
  - `ansible_sudo_pass`: The sudo password. This can be useful if the user you are connecting with does not have passwordless sudo enabled.
  - `ansible_connection`: The connection type. This can be useful if you want to use a different connection type (for example, `paramiko`).
  - `ansible_python_interpreter`: The path to the Python interpreter. This can be useful if you have a non-standard Python installation.
  - `ansible_shell_type`: The shell type. This can be useful if you want to use a different shell (for example, `csh`).

- patterns

  - `* | all`: Matches everything
  - `?`: Matches any single character
  - `[seq]`: Matches any character in seq
  - `[!seq]`: Matches any character not in seq
  - `[start:end]`: Matches any character in the range from start to end
  - `~`: Using regular expressions
  - `--limit`: Exclude hosts from the pattern

### Ad-Hoc Commands

- Ad-hoc commands are commands that you run on the fly. They are useful for quick changes or one-off commands.

#### file module

- copy a file to a remote server
    ```bash
    ansible webserver -m file -a "src=/etc/hosts dest=/tmp/hosts"
    ```

- create a directory on a remote server
    ```bash
    ansible webserver -m file -a "path=/tmp/testdir state=directory"
    ```

- delete a file on a remote server
    ```bash
    ansible webserver -m file -a "path=/tmp/hosts state=absent"
    ```

- change the permissions of a file on a remote server
    ```bash
    ansible webserver -m file -a "path=/tmp/hosts mode=0644"
    ```

- change the owner and group of a file on a remote server
    ```bash
    ansible webserver -m file -a "path=/tmp/hosts owner=ubuntu group=ubuntu"
    ```

#### manage packages

- install a package on a remote server
    ```bash
    ansible webserver -m yum -a "name=httpd state=present"
    ```

- remove a package from a remote server
    ```bash
    ansible webserver -m yum -a "name=httpd state=absent"
    ```

- update all packages on a remote server
    ```bash
    ansible webserver -m yum -a "name=* state=latest"
    ```

- check if a package is installed on a remote server
    ```bash
    ansible webserver -m yum -a "name=httpd state=latest"
    ```

#### user and group management

- create a user on a remote server
    ```bash
    ansible webserver -m user -a "name=ansible password
    ```

- remove a user from a remote server
    ```bash
    ansible webserver -m user -a "name=ansible state=absent"
    ```

#### source control

- clone a git repository to a remote server
    ```bash
    ansible webserver -m git -a "repo=git://foo.example.org/repo.git dest=/srv/myapp version=HEAD"
    ```

#### service management

- start a service on a remote server
    ```bash
    ansible webserver -m service -a "name=httpd state=started"
    ```

- stop a service on a remote server
    ```bash
    ansible webserver -m service -a "name=httpd state=stopped"
    ```

- restart a service on a remote server
    ```bash
    ansible webserver -m service -a "name=httpd state=restarted"
    ```

- check if a service is running on a remote server
    ```bash
    ansible webserver -m service -a "name=httpd state=running"
    ```

#### long-running tasks

- run a command in the background on a remote server
    ```bash
    ansible webserver -B 3600 -P 0 -a "sleep 3600"  # -B: timeout, -P: poll interval
    
    ```

- check the status of a long-running task on a remote server
    ```bash
    ansible webserver -m async_status -a "jid=12345"
    ```

- kill a long-running task on a remote server
    ```bash
    ansible webserver -m command -a "kill -9 12345"
    ```

- gather facts
    ```bash
    ansible webserver -m setup
    ```

### Modules

- Units of code that Ansible uses to perform tasks.

### Tasks

- A task is a unit of work that Ansible will perform. Usually, a task will use a module to perform the work.

### Playbooks

- A playbook is a collection of tasks that will be run on a set of hosts.

#### Examples

- run a command module on a remote server
    ```yaml
    - name: Run a command on a remote server
      hosts: all
      tasks:
        - name: Run the `uptime` command
          command: uptime
    ```

- run a shell module on a remote server
    ```yaml
    - name: Run a shell command on a remote server
      hosts: all
      tasks:
        - name: run a command and ignore the result
          shell: /bin/somecommand
          ignore_errors: True
    ```

- run a command using modules by a specific user
    ```yaml
    - name: Run a command on a remote server
      hosts: all
      tasks:
        - name: Run the `uptime` command
          command: uptime
          become: yes
          become_user: root
    ```

- a playbook to install the Apache web server
    ```yaml
    - hosts: webserver
      vars:
        http_port: 80
        maxRequestsPerChild: 808
        max_clients: 200
      remote_user: root
      tasks:
        - name: Install Apache
          yum:
            name: httpd
            state: present
        - name: write the apache config file
          template:
            src: /srv/httpd.j2
            dest: /etc/httpd.conf
          notify: restart apache    # notify: execute after the task
        - name: start apache
          service:
            name: httpd
            state: started
      handlers:
        - name: restart apache
          service:
            name: httpd
            state: restarted
    ```

### Roles

- Reusable collections of tasks and templates.

- Directory structure:

    ```yaml
    - `roles/`
        - `common/`
        - `tasks/`        # Main list of tasks to be executed by the role
            - `main.yml`
        - `handlers/`     # Handlers, which may be used within or outside this role
            - `main.yml`
        - `templates/`    # Template files, which can be used by the `template` module
            - `ntp.conf.j2`
        - `files/`        # Files which can be deployed via the `copy` module
            - `ntp.conf`
        - `vars/`         # Variables for the role
            - `main.yml`
        - `defaults/`     # Default variables for the role
            - `main.yml`
        - `meta/`         # Metadata for the role
            - `main.yml`
    ```

- Example of a role:

    ```yaml
    - name: run the common role
    hosts: webserver
    roles:
        - common
    ```