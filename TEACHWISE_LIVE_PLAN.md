# TeachWise Live Plan

## Where We Are Now

- The app has been redesigned to match the reference screenshot much more closely.
- The TeachWise logo is now using the screenshot crop as the source of truth.
- Supabase env values are already set locally on this machine.
- The repo metadata issue in `.git/` has been repaired enough to use git again.
- The local dependency tree is still being stabilized after the interrupted install recovery, so build validation is the main thing left before publishing.

## Current Product State

- Dark teacher workspace shell is in place.
- Left navigation, top command bar, split workspace layout, and right rail are implemented.
- Auth pages and Supabase wiring are present.
- Workspace persistence is set up to fall back locally when Supabase is not available.
- The app is not ready to call "live" until the build passes cleanly and the current branch is pushed and deployed.

## Sequence To Get Live

1. Finish repairing any remaining broken `node_modules` packages until `npm run build` passes.
2. Verify the app locally in the browser after the build is clean.
3. Commit the current checkpoint to the `codex/teachwise-saas-persistence` branch.
4. Push that branch to GitHub.
5. Deploy the branch to Vercel.
6. Confirm the deployment loads and the main routes work in the hosted environment.
7. Apply the Supabase schema to the project.
8. Set the same Supabase env vars in Vercel.
9. Test sign-up, sign-in, session persistence, and workspace saving in the deployed app.
10. Do a final polish pass only after the hosted flow is stable.

## What Needs To Be True Before We Ship

- `npm run build` completes without dependency or config errors.
- The logo matches the screenshot well enough that we do not keep reworking it.
- The local app and Vercel deployment both render the same shell.
- Supabase auth is usable end to end.
- Workspace state survives refresh and sign-in.

## Recommended Milestone Order

### Milestone 1: Stabilize the local build
- Repair the remaining dependency folders.
- Confirm the app builds cleanly.
- Confirm the browser render matches the design.

### Milestone 2: Publish the design checkpoint
- Commit and push the current branch.
- Create or update the PR.
- Deploy to Vercel.

### Milestone 3: Turn on the hosted product layer
- Apply the Supabase schema.
- Wire Vercel env vars.
- Validate auth and persistence in production.

### Milestone 4: Final polish
- Fix any visual drift found in the hosted build.
- Tighten small interactions and empty states.
- Lock the next product slice.

## Notes For Tomorrow

- If the remaining dependency repair finishes cleanly, the next action is not more UI churn.
- The next action is publishing the checkpoint so we can work against the hosted environment with confidence.
- After that, the Supabase/auth milestone becomes the main event.
