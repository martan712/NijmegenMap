"""Import every submodule of a package so its @register_stage decorators and
catalog registrations run as a side effect. This is what makes "drop a file in
catalog/ (or catalog/chapters/) and it shows up" work — no central list to edit.
Recurses into subpackages, so chapter modules are discovered too."""
import importlib
import pkgutil


def import_submodules(package):
    for info in pkgutil.walk_packages(package.__path__, package.__name__ + "."):
        importlib.import_module(info.name)
