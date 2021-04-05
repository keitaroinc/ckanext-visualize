import os
import sys

def add_headers(license, year, path, ext, long_comment_start, long_comment_end):
    AGPL_30_header = "\n\nThis program is free software: you can redistribute it and/or modify\nit under the terms of the GNU Affero General Public License as\npublished by the Free Software Foundation, either version 3 of the\nLicense, or (at your option) any later version.\n\nThis program is distributed in the hope that it will be useful,\nbut WITHOUT ANY WARRANTY; without even the implied warranty of\nMERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the\nGNU Affero General Public License for more details.\n\nYou should have received a copy of the GNU Affero General Public License\nalong with this program.  If not, see <https://www.gnu.org/licenses/>.\n"

    Apache_20_header = '\n\nLicensed under the Apache License, Version 2.0 (the "License");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\nhttps://www.apache.org/licenses/LICENSE-2.0\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an "AS IS" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.'

    MIT_header = "\n\nUse of this source code is governed by an MIT license\nthat can be found in the LICENSE file or at\nhttps://opensource.org/licenses/MIT.\n"

    copyright_warning = "********************** File may contain copyright notice. Inspect manually **********************"

    copyright_line="Copyright (c) "+ year +" Keitaro AB"
    
    third_party_copyright_indicator_keywords = ["copyright", "license", "author"]

    # Step through all the files in the current working directory:
    for root, dirs, files in os.walk(path):
        for file in files:
            if ext in file:
                f1name = str(os.path.join(root,file))
                f1 = open(f1name, "r")
                f1lines = f1.readlines()
                f1.close()

                # Are there words at the top or at the bottom of
                # the document that might indicate third party copyright?
                add_header = True
                counts = 0
                if (len(f1lines) > 15):
                    for i in range(0, 15):
                        for keyword in third_party_copyright_indicator_keywords:
                            if (keyword in f1lines[i].lower()):
                                print (f1name)
                                print (copyright_warning)
                                add_header = False
                                break
                        if (add_header == False):
                            break
                    if f1lines[-1][-1] == '\n':
                        f1lines.append('\n') # readlines merges blank last line
                                             # with line above
                    for i in range(len(f1lines)-16, len(f1lines)-1):
                        for keyword in third_party_copyright_indicator_keywords:
                            if (keyword in f1lines[i].lower()):
                                print (f1name)
                                print (copyright_warning)
                                add_header = False
                                break
                        if (add_header == False):
                            break
                elif (len(f1lines) > 0 and len(f1lines) <= 15):
                    if f1lines[-1][-1] == '\n':
                        f1lines.append('\n')
                    for i in range(0, len(f1lines)-1):
                        for keyword in third_party_copyright_indicator_keywords:
                            if (keyword in f1lines[i].lower()):
                                print (f1name)
                                print (copyright_warning)
                                add_header = False
                                break
                        if (add_header == False):
                            break

                # Does the path of the file indicate third party copyright?
                if ("vendor" in f1name or ".min.js" in f1name):
                        print (f1name)
                        print (copyright_warning)
                        add_header = False

                # If it doesn't seem like there is an indication of
                # third party copyright, then add the keitaro copyright
                # header at the top of the file
                if (add_header):
                    f2name = os.path.join("copy",root,"tmp")
                    f2 = open(f2name, "w")
                    f2.write(long_comment_start)
                    f2.write("\n")
                    f2.write(copyright_line)
                    if (license == "AGPL"):
                        f2.write(AGPL_30_header)
                    elif (license == "Apache"):
                        f2.write(Apache_20_header)
                    elif (license == "MIT"):
                        f2.write(MIT_header)
                    f2.write(long_comment_end)
                    f2.write("\n")
                    f2.write("\n")
                    for i in range(0, len(f1lines)):
                        f2.write(f1lines[i])
                    os.remove(f1name)
                    os.replace(f2name, f1name)

                
                
year="2019"
path = os.getcwd()
license = "MIT"
if (license == "AGPL" or license == "Apache" or license == "MIT"):
    add_headers(license, year, path, ".py", '"""', '"""')
    add_headers(license, year, path, ".js", "/*", "*/")
    add_headers(license, year, path, ".css", "/*", "*/")
    add_headers(license, year, path, ".html", "<!--", "-->")
else:
    print("typo in license")
    sys.exit()


