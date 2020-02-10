FROM keitaro/ckan:2.8.2-clean

MAINTAINER Keitaro <info@keitaro.com>

USER root

# Install extension
RUN pip install --no-cache-dir -e "git+https://github.com/keitaroinc/ckanext-visualize.git#egg=ckanext-visualize" && \
  pip install --no-cache-dir -r "${APP_DIR}/src/ckanext-visualize/requirements.txt"

ENV CKAN__PLUGINS \
  envvars \
  stats \
  text_view \
  image_view \
  recline_view \
  visualize \
  datastore \
  datapusher

RUN mkdir -p /var/lib/ckan/default && chown -R ckan:ckan /var/lib/ckan/default
VOLUME /var/lib/ckan/default

# Load envvars plugin on ini file
RUN paster --plugin=ckan config-tool ${APP_DIR}/production.ini "ckan.plugins = ${CKAN__PLUGINS}"

CMD ["/srv/app/start_ckan.sh"]
