# Skill: Repo Cleanup

## Purpose

Clean local project folders and caches without destroying source work.

## Inputs

- Target folder, cache, repo, or disk pressure goal.

## Preconditions

- Start read-only.
- Run disk and git inspection before deletion.
- Prefer moving inactive work to storage over deletion when source value is
  uncertain.

## Tool Steps

1. Inspect `df -hT`, `lsblk`, and relevant folder sizes.
2. Check git status in any repo being touched.
3. Identify cache vs source.
4. Delete only confirmed cache or explicitly approved paths.
5. Verify reclaimed space.

## Failure Modes

- Deleting dirty repo work.
- Assuming `/mnt/storage` is mounted when it is not.
- Removing project folders instead of caches.

## Done Criteria

- Cleanup target is gone or archived.
- Disk usage is reported before and after.
- No unrelated source work is removed.

