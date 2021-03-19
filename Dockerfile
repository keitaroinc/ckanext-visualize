###################
### Extensions ####
###################
FROM ghcr.io/keitaroinc/ckan:2.9.2 as extbuild

# Extension versions
ENV CKANEXT_VISUALIZE_URL=https://github.com/keitaroinc/ckanext-visualize
ENV CKANEXT_VISUALIZE_VERSION=master

# Switch to the root user
USER root

# Install any system packages necessary to build extensions
RUN apk add --no-cache \
        python3-dev

# Fetch and build the custom CKAN extensions
RUN pip wheel --wheel-dir=/wheels git+${CKANEXT_VISUALIZE_URL}@${CKANEXT_VISUALIZE_VERSION}#egg=ckanext-visualize
RUN curl -o /wheels/visualize.txt https://raw.githubusercontent.com/keitaroinc/ckanext-visualize/${CKANEXT_VISUALIZE_VERSION}/requirements.txt

############
### MAIN ###
############
FROM ghcr.io/keitaroinc/ckan:2.9.2

LABEL maintainer="Keitaro Inc <info@keitaro.com>"
LABEL org.opencontainers.image.source https://github.com/keitaroinc/docker-ckan

# Add the custom extensions to the plugins list
ENV CKAN__PLUGINS envvars image_view text_view recline_view datastore datapusher visualize

# Switch to the root user
USER root

COPY --from=extbuild /wheels /srv/app/ext_wheels

RUN apk add --no-cache \
        py3-natsort

# Install and enable the custom extensions
RUN pip install --no-index --find-links=/srv/app/ext_wheels -r /srv/app/ext_wheels/visualize.txt && \
    pip install --no-index --find-links=/srv/app/ext_wheels ckanext-visualize && \
    ckan config-tool ${APP_DIR}/production.ini "ckan.plugins = ${CKAN__PLUGINS}" && \
    chown -R ckan:ckan /srv/app

# Remove wheels
RUN rm -rf /srv/app/ext_wheels

# Switch to the ckan user
USER ckan