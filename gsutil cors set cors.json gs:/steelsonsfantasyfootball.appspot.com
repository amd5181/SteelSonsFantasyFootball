
# The next line updates PATH for the Google Cloud SDK.
if [ -f '/workspaces/steelsonsfantasyfootball/which gsutil/google-cloud-sdk/path.bash.inc' ]; then . '/workspaces/steelsonsfantasyfootball/which gsutil/google-cloud-sdk/path.bash.inc'; fi

# The next line enables shell command completion for gcloud.
if [ -f '/workspaces/steelsonsfantasyfootball/which gsutil/google-cloud-sdk/completion.bash.inc' ]; then . '/workspaces/steelsonsfantasyfootball/which gsutil/google-cloud-sdk/completion.bash.inc'; fi
